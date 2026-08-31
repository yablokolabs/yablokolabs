const symptomChecks = [
  {
    check: "docker compose ps",
    result: "every container Up, api and restate healthy",
  },
  {
    check: "curl from the host to the internet",
    result: "fast, normal egress",
  },
  {
    check: "curl from inside the container to the internet",
    result: "hangs — no error, no timeout, nothing",
  },
  {
    check: "claude -p inside the container (the PONG check)",
    result: "hangs identically",
  },
];

const redHerrings = [
  {
    layer: "Docker's own nftables rules",
    verdict: "looked correct",
    detail:
      "FORWARD policy accept, the compose bridge accepted, a MASQUERADE rule present for the subnet.",
  },
  {
    layer: "Host routing",
    verdict: "looked correct",
    detail: "ip_forward = 1, default route present, the compose bridge UP with its veths.",
  },
  {
    layer: "The actual drop",
    verdict: "invisible to nft",
    detail:
      "A second, stale iptables-legacy ruleset ran FORWARD with policy DROP and only knew docker0.",
  },
];

const fixCommands = `# Derive the compose network's bridge and subnet from the running stack,
# so the same commands work on any machine.
CONTAINER=$(docker compose ps -q api)
NETWORK=$(docker inspect "$CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}')
BRIDGE=br-$(docker network inspect "$NETWORK" --format '{{.Id}}' | cut -c1-12)
SUBNET=$(docker network inspect "$NETWORK" --format '{{(index .IPAM.Config 0).Subnet}}')

sudo iptables-legacy -I DOCKER-FORWARD -i "$BRIDGE" -j ACCEPT
sudo iptables-legacy -I DOCKER-CT -o "$BRIDGE" -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables-legacy -t nat -A POSTROUTING -s "$SUBNET" ! -o "$BRIDGE" -j MASQUERADE`;

function Ref({ n }: { n: number }) {
  return (
    <sup className="blog-ref">
      <a href={`#source-${n}`}>[{n}]</a>
    </sup>
  );
}

export default function DockerComposeEgressLegacyIptables() {
  return (
    <>
      <h2 id="the-symptom">The symptom: a health check that hangs forever</h2>
      <p>
        <strong>Your Docker Compose stack is up. Every container reports healthy. And your agent cannot reach the
        internet at all.</strong> The model-reachability probe — a one-line <code>claude -p</code> call from inside
        the container — never returns. No error, no timeout message, no stack trace. Just silence, forever, retried.
      </p>
      <p>
        We hit this while wiring up a Telegram demo for an agent stack running in Compose. The container could reach
        its siblings on the compose network and the host could reach the internet, but the container itself had zero
        outbound connectivity. Here is the trail, including the part that made it take far too long:{" "}
        <strong>everything you normally check looked correct.</strong>
      </p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>What it showed</th>
            </tr>
          </thead>
          <tbody>
            {symptomChecks.map((row) => (
              <tr key={row.check}>
                <td><code>{row.check}</code></td>
                <td>{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="red-herrings">The red herrings</h2>
      <p>
        The default Docker bridge (<code>docker0</code>) had working egress. A throwaway container on that bridge
        reached <code>1.1.1.1</code> in milliseconds. Only traffic from the <em>compose</em> bridge was being
        dropped — which is exactly the kind of difference that sends you looking in the wrong place.
      </p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Layer</th>
              <th>Verdict</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {redHerrings.map((row) => (
              <tr key={row.layer}>
                <td><strong>{row.layer}</strong></td>
                <td>{row.verdict}</td>
                <td>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        The tell was a counter. Docker&apos;s nftables NAT rules showed a <code>MASQUERADE</code> rule for the compose
        subnet — but its packet counter sat at <strong>zero</strong> while the FORWARD counters were ticking. Traffic
        was arriving at the host and being forwarded… and then never reaching NAT. Something was dropping it in
        between.<Ref n={1} />
      </p>

      <h2 id="two-rulesets">Two firewall rulesets, one of them stale</h2>
      <p>
        The machine ran both iptables backends at once: Docker&apos;s modern <strong>nftables</strong> rules, and a
        leftover <strong>legacy xtables</strong> ruleset from an older install that had never been cleaned up. The
        kernel runs both hooks, in sequence.
      </p>
      <p>
        The legacy ruleset&apos;s <code>FORWARD</code> chain had <code>policy DROP</code> and only knew about the
        default <code>docker0</code> bridge:
      </p>
      <pre className="blog-code"><code>{`$ sudo iptables-legacy -L FORWARD -n -v
Chain FORWARD (policy DROP ...)
    DOCKER-USER   all  --  *      *       ...
    DOCKER-FORWARD all --  *      *       ...
    # no rule matching br-<compose-bridge> — everything from it falls to policy DROP`}</code></pre>
      <p>
        The compose bridge&apos;s traffic was accepted by Docker&apos;s nftables FORWARD chain, then dropped a
        millisecond later by the stale legacy chain&apos;s policy. From the outside, the stack looked flawless.
        Container-to-container traffic on the same bridge worked because it never leaves the bridge; only traffic
        that had to be <em>forwarded</em> out — which is the traffic that matters — died at the legacy policy.
      </p>

      <h2 id="the-fix">The fix: accept the compose bridge in the legacy chains</h2>
      <p>
        Three rules in the legacy ruleset mirror what Docker&apos;s nftables rules already do for{" "}
        <code>docker0</code>: accept outgoing traffic from the compose bridge, accept return traffic into it, and
        masquerade its subnet out.<Ref n={2} /> The bridge name and subnet are derived from the running stack so the
        same commands work on any machine:
      </p>
      <pre className="blog-code blog-code-good"><code>{fixCommands}</code></pre>
      <p>
        The <code>DOCKER-CT</code> rule is the one that is easy to miss — allowing only the outbound direction fixes
        nothing, because the replies coming back into the bridge hit the same stale <code>policy DROP</code>. You
        need both directions, exactly as Docker&apos;s own rules provide for <code>docker0</code>.
      </p>
      <aside className="blog-callout blog-callout-warning">
        <span className="blog-callout-label">Runtime-only</span>
        <p>
          These rules are not persisted. They die on reboot, and the hang returns. If you apply them on a box you
          reboot regularly, put them in a small script or systemd unit rather than trusting your memory at 2am.
        </p>
      </aside>

      <h2 id="the-lesson">The lesson: &ldquo;the rules look right&rdquo; can mean you looked at the wrong ruleset</h2>
      <p>
        The expensive part of this debugging was not the fix — it was that every normal diagnostic pointed at a
        healthy system. Docker&apos;s rules were correct. The host&apos;s routing was correct. The only signal that
        something was wrong was a NAT counter that refused to move, and the only way to see the true culprit was to
        check the <em>other</em> ruleset explicitly.
      </p>
      <ul className="blog-list">
        <li>If a container&apos;s egress is dead but <code>docker0</code> works, suspect a second ruleset — check <code>iptables-legacy -L FORWARD -n -v</code> even when nft looks fine.</li>
        <li>Counters are evidence: a MASQUERADE rule that has never matched means traffic is dying before NAT, not after.</li>
        <li>Ask the remote end. A <code>curl</code> from inside the container is worth a hundred reads of the firewall config, because it tests the whole path.</li>
      </ul>

      <h2 id="sources">Sources</h2>
      <ol className="blog-sources">
        <li id="source-1">
          <a href="https://docs.docker.com/network/packet-filtering-firewalls/" target="_blank" rel="noopener noreferrer">
            Docker and iptables — Docker documentation
          </a>
        </li>
        <li id="source-2">
          <a href="https://manpages.debian.org/bookworm/iptables/iptables-legacy.8.en.html" target="_blank" rel="noopener noreferrer">
            iptables-legacy(8) — Debian man page
          </a>
        </li>
      </ol>
    </>
  );
}
