import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';

type Scenario = {
  id: string;
  category: 'NOC' | 'SOC';
  title: string;
  device: string;
  metric: string;
  targetThreshold: string;
  severity: 'P1-Critical' | 'P2-High' | 'P3-Medium';
  ticketId: string;
  rawPayload: {
    endpoint: string;
    method: string;
    body: Record<string, any>;
  };
  logs: { text: string; delay: number; color?: string }[];
};

const SCENARIOS: Scenario[] = [
  // ─── NOC SCENARIOS ──────────────────────────────────────────────────────────
  {
    id: 'device-up-down',
    category: 'NOC',
    title: 'NOC: DeviceUpDown (Core Router ICMP Timeout)',
    device: 'cr01.mum.tatacommunications.net (10.20.1.1)',
    metric: 'ICMP Echo Heartbeat',
    targetThreshold: '100% Packet Loss / 0/5 Pings',
    severity: 'P1-Critical',
    ticketId: 'INC0948501',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Network Operations (NOC)',
        subcategory: 'Device Reachability',
        cmdb_ci: 'cr01.mum.tatacommunications.net',
        impact: '1 - Critical',
        urgency: '1 - Critical',
        short_description: 'Auto-Remediated: DeviceUpDown on Mumbai Core PE 10.20.1.1',
        state: '6 - Resolved',
        close_code: 'Solved by Autonomous Python Runbook',
        close_notes: 'OOB console power cycle executed via PDU API; core BGP/OSPF adjacencies verified restored.',
      },
    },
    logs: [
      { text: '[00:00.10] [SevOne Poller] ICMP ping timeout for device 10.20.1.1 (cr01.mum) — 5/5 packets lost', delay: 100, color: '#EF4444' },
      { text: '[00:00.35] [DISHA / Assure1] Event: DeviceUpDown (Status: CRITICAL, Node: MUM-PE01)', delay: 400, color: '#EF4444' },
      { text: '[00:00.70] [PYTHON_NOC_DAEMON] /opt/noc/device_recovery.py triggered for target 10.20.1.1', delay: 850, color: '#38BDF8' },
      { text: '[00:01.20] [AUTOMATION] Out-of-band IPMI/PDU query initiated; detected stuck routing engine kernel', delay: 1350 },
      { text: '[00:01.70] [AUTOMATION] Graceful failover to Backup Routing Engine (RE1) triggered over management link', delay: 1850, color: '#10B981' },
      { text: '[00:02.20] [SEVONE_VERIFY] ICMP ping response: 5/5 received, avg RTT = 4.2ms. BGP convergence achieved.', delay: 2350, color: '#34D399' },
      { text: '[00:02.70] [SERVICENOW_API] Dispatched POST /api/now/table/incident ➔ Ticket INC0948501', delay: 2850, color: '#F59E0B' },
      { text: '[00:03.10] [STATUS] Ticket INC0948501 marked Resolved. Full memory dump attached to RCA.', delay: 3200, color: '#10B981' },
    ],
  },
  {
    id: 'interface-up-down',
    category: 'NOC',
    title: 'NOC: InterfaceUpDown (Physical Link Flap)',
    device: 'cr02.lon.tatacommunications.net (10.24.1.2)',
    metric: 'Carrier Interface Status',
    targetThreshold: 'Link State: DOWN (xe-0/1/0.100)',
    severity: 'P2-High',
    ticketId: 'INC0948512',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Network Operations (NOC)',
        subcategory: 'Interface Flap',
        cmdb_ci: 'cr02.lon.tatacommunications.net',
        impact: '2 - High',
        urgency: '2 - High',
        short_description: 'Auto-Remediated: InterfaceUpDown flap on xe-0/1/0.100 London PoP',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.12] [SevOne Trap] Ingested SNMP trap linkDown (OID 1.3.6.1.6.3.1.1.5.3) on xe-0/1/0.100', delay: 100 },
      { text: '[00:00.40] [DISHA / Assure1] Alarm: InterfaceUpDown — interface operational state changed to DOWN', delay: 450, color: '#EF4444' },
      { text: '[00:00.80] [PYTHON_RUNBOOK] /opt/noc/interface_cycle.py --interface=xe-0/1/0.100 triggered', delay: 900, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] Optical DDM Diagnostics: Tx Power -2.1 dBm, Rx Power -3.4 dBm (Optics Normal)', delay: 1400 },
      { text: '[00:01.80] [AUTOMATION] Executed administrative flap (shutdown ➔ no shutdown) and cleared interface error counters', delay: 1900, color: '#10B981' },
      { text: '[00:02.30] [SEVONE_VERIFY] SNMP linkUp trap received. Traffic forwarding restored (0 drops).', delay: 2400, color: '#34D399' },
      { text: '[00:02.75] [SERVICENOW_API] INC0948512 logged with DDM optical levels and marked Resolved', delay: 2850, color: '#10B981' },
    ],
  },
  {
    id: 'nni-lag-down',
    category: 'NOC',
    title: 'NOC: NNI LAG Down (Carrier Interconnect Failure)',
    device: 'nni-gw01.sin.tatacommunications.net (ae12)',
    metric: 'LACP Member Link Status',
    targetThreshold: '2 of 2 Members Down (LAG Failure)',
    severity: 'P1-Critical',
    ticketId: 'INC0948523',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Carrier NNI Interconnect',
        cmdb_ci: 'nni-gw01.sin.tatacommunications.net (ae12)',
        impact: '1 - Critical',
        short_description: 'Auto-Remediated: NNI LAG Down on aggregate interface ae12 Singapore',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.15] [SevOne Trap] Aggregate interface ae12 (NNI Interconnect) transitioned to DOWN', delay: 100, color: '#EF4444' },
      { text: '[00:00.45] [DISHA / Assure1] Alarm: NNI LAG Down — Carrier handoff bundle unoperational', delay: 500, color: '#EF4444' },
      { text: '[00:00.90] [PYTHON_RUNBOOK] /opt/telecom/remediate_nni_lag.py --bundle=ae12 triggered', delay: 950, color: '#38BDF8' },
      { text: '[00:01.40] [AUTOMATION] Detected desynchronized LACP actor/partner state with peer carrier switch', delay: 1450 },
      { text: '[00:01.90] [AUTOMATION] Rerouted transit prefixes to alternate NNI bundle ae14; renegotiated LACP fast-rate', delay: 1950, color: '#10B981' },
      { text: '[00:02.40] [SEVONE_VERIFY] ae12 member links ge-0/0/2 and ge-0/0/3 restored to Collecting/Distributing state', delay: 2450, color: '#34D399' },
      { text: '[00:02.85] [SERVICENOW_API] INC0948523 auto-resolved under 15-minute P1 carrier SLA', delay: 2900, color: '#10B981' },
    ],
  },
  {
    id: 'link-3-updown',
    category: 'NOC',
    title: 'NOC: LINK-3-UPDOWN (Cisco Core Trunk Flap)',
    device: 'cisco-cr03.fra.tatacommunications.net',
    metric: 'Cisco Syslog LINK-3-UPDOWN',
    targetThreshold: '4 Flaps in 30 Seconds',
    severity: 'P2-High',
    ticketId: 'INC0948534',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Cisco Core Routing',
        cmdb_ci: 'cisco-cr03.fra.tatacommunications.net',
        short_description: 'Auto-Remediated: %LINK-3-UPDOWN flapping suppressed on TenGigE0/2/0/1',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.10] [Syslog] %LINK-3-UPDOWN: Interface TenGigE0/2/0/1, changed state to down', delay: 100, color: '#EF4444' },
      { text: '[00:00.35] [DISHA / Assure1] LINK-3-UPDOWN flap damping threshold exceeded (4 events in 30s)', delay: 400, color: '#EF4444' },
      { text: '[00:00.80] [PYTHON_RUNBOOK] /opt/cisco/link_flap_dampener.py triggered', delay: 850, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] Applied carrier link-delay carrier-delay up 2000 down 0 on interface', delay: 1350 },
      { text: '[00:01.80] [AUTOMATION] Traffic diverted onto low-latency Frankfurt-Paris backup DWDM lambda', delay: 1850, color: '#10B981' },
      { text: '[00:02.30] [SEVONE_VERIFY] Syslog flap stream silenced. Link state steady for 120s.', delay: 2350, color: '#34D399' },
      { text: '[00:02.75] [SERVICENOW_API] Ticket INC0948534 auto-resolved with optical OTDR diagnostics attached', delay: 2800, color: '#10B981' },
    ],
  },
  {
    id: 'drivelink-updown',
    category: 'NOC',
    title: 'NOC: DrivelinkUpDown Failure (Cable Landing Station)',
    device: 'cls-chennai-gw01.tatacommunications.net',
    metric: 'Undersea Cable Drivelink State',
    targetThreshold: 'Subsea Drivelink Down (Tx/Rx Loss)',
    severity: 'P1-Critical',
    ticketId: 'INC0948545',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Subsea Cable Systems',
        cmdb_ci: 'cls-chennai-gw01.tatacommunications.net',
        short_description: 'Auto-Remediated: DrivelinkUpDown failure on Chennai CLS Trans-Indian Ring',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.12] [SevOne Trap] DrivelinkUpDown: Chennai-Singapore Subsea Ring 2 failure detected', delay: 100, color: '#EF4444' },
      { text: '[00:00.40] [DISHA / Assure1] Critical SLA Breach Warning: Chennai Landing Station Drivelink Down', delay: 450, color: '#EF4444' },
      { text: '[00:00.85] [PYTHON_RUNBOOK] /opt/subsea/reroute_drivelink.py --cls=chennai triggered', delay: 900, color: '#38BDF8' },
      { text: '[00:01.35] [AUTOMATION] Triggered DWDM ASON optical mesh dynamic wavelength restoration', delay: 1400 },
      { text: '[00:01.90] [AUTOMATION] Rerouted 400 Gbps trans-oceanic payload via Colombo-Penang secondary path', delay: 1950, color: '#10B981' },
      { text: '[00:02.40] [SEVONE_VERIFY] Telemetry confirmation: Zero customer circuit drops; BER < 10^-12', delay: 2450, color: '#34D399' },
      { text: '[00:02.85] [SERVICENOW_API] Dispatched INC0948545 to NOC Subsea Tier-3 with optical logs attached', delay: 2900, color: '#10B981' },
    ],
  },
  {
    id: 'juniper-link-updown',
    category: 'NOC',
    title: 'NOC: JuniperLinkUpDown & OSPF Area Flap',
    device: 'mx960-core01.tok.tatacommunications.net',
    metric: 'Juniper SNMP ge-1/0/0 State',
    targetThreshold: 'Loss of Light / OSPF DeadTimer Expired',
    severity: 'P1-Critical',
    ticketId: 'INC0948556',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.netops@tatacommunications.net',
        category: 'Juniper Core Infrastructure',
        cmdb_ci: 'mx960-core01.tok.tatacommunications.net',
        short_description: 'Auto-Remediated: JuniperLinkUpDown & OSPF Area 0 neighbor loss on Tokyo Core',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.10] [Junos SNMP] jnxOperatingState down for ge-1/0/0; OSPF neighbor 10.10.4.1 down', delay: 100, color: '#EF4444' },
      { text: '[00:00.35] [DISHA / Assure1] Alarm: JuniperLinkUpDown & OSPF Area 0 backbone neighbor lost', delay: 400, color: '#EF4444' },
      { text: '[00:00.80] [PYTHON_RUNBOOK] /opt/junos/remediate_juniper_link.py --target=10.10.4.1 triggered', delay: 850, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] PyEZ Junos RPC invoked: checked interface ddm; re-synchronized OSPF hello timer', delay: 1350 },
      { text: '[00:01.80] [AUTOMATION] Cleared MAC address table & flushed ARP cache on Juniper MX960 FPC slot 1', delay: 1850, color: '#10B981' },
      { text: '[00:02.30] [SEVONE_VERIFY] OSPF adjacency transitioned from INIT ➔ 2-WAY ➔ FULL. Link restored.', delay: 2350, color: '#34D399' },
      { text: '[00:02.80] [SERVICENOW_API] INC0948556 marked Resolved with Junos command outputs attached', delay: 2850, color: '#10B981' },
    ],
  },

  // ─── SOC SCENARIOS (IIL & GVPN) ─────────────────────────────────────────────
  {
    id: 'soc-iil-security',
    category: 'SOC',
    title: 'SOC: IIL (Internet Leased Line) Security Breach',
    device: 'iil-pe02.blr.tatacommunications.net (Client: Fintech)',
    metric: 'IIL Port Threat Detection',
    targetThreshold: 'Unauthorized Route Leak / SYN Flood Spike',
    severity: 'P1-Critical',
    ticketId: 'SEC-INC0949201',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.soc@tatacommunications.net',
        category: 'IIL Customer Security',
        cmdb_ci: 'iil-pe02.blr.tatacommunications.net',
        impact: '1 - Critical',
        short_description: 'Auto-Remediated: IIL Port SYN Flood & Malicious Route Injection blocked',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.12] [SOC SIEM / Assure1] Security Event: IIL Customer Port 10.45.1.88 anomalous traffic spike', delay: 100, color: '#EF4444' },
      { text: '[00:00.38] [SevOne Flow] NetFlow telemetry detected 850K pps SYN flood & spoofed bogon prefixes', delay: 450, color: '#EF4444' },
      { text: '[00:00.80] [PYTHON_SOC_GUARD] /opt/soc/iil_quarantine_runbook.py triggered', delay: 900, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] Injected ACL firewall filter on customer sub-interface blocking bogon IPs', delay: 1400 },
      { text: '[00:01.80] [AUTOMATION] Activated Tata Communications DDoS Clean Pipe scrubber on IIL circuit', delay: 1900, color: '#10B981' },
      { text: '[00:02.35] [SEVONE_VERIFY] Legitimate IIL enterprise traffic normalized to 100 Mbps clean profile', delay: 2400, color: '#34D399' },
      { text: '[00:02.80] [SERVICENOW_API] SEC-INC0949201 dispatched with full pcap payload header capture', delay: 2850, color: '#10B981' },
    ],
  },
  {
    id: 'soc-gvpn-ospf',
    category: 'SOC',
    title: 'SOC: GVPN (Global VPN) OSPF State Flap & Hijack',
    device: 'gvpn-pe01.ams.tatacommunications.net (VRF: Enterprise_GVPN)',
    metric: 'GVPN VRF OSPF Adjacency',
    targetThreshold: 'BGP/MPLS IP-VPN Route Table Hijack Spike',
    severity: 'P1-Critical',
    ticketId: 'SEC-INC0949212',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.soc@tatacommunications.net',
        category: 'GVPN / MPLS Threat Mitigation',
        cmdb_ci: 'gvpn-pe01.ams.tatacommunications.net',
        short_description: 'Auto-Remediated: GVPN OSPF Neighbor Flap & Malicious LSA Injection blocked',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.15] [DISHA / Assure1] Threat Alarm: GVPN (Global VPN) customer VRF OSPF route flap', delay: 100, color: '#EF4444' },
      { text: '[00:00.40] [SevOne Trap] OSPF NbrStateChange (neighbor 172.16.8.1 state Down) in GVPN routing instance', delay: 450, color: '#EF4444' },
      { text: '[00:00.85] [PYTHON_SOC_GUARD] /opt/soc/gvpn_ospf_validator.py triggered', delay: 900, color: '#38BDF8' },
      { text: '[00:01.35] [AUTOMATION] Validated MD5 cryptographic authentication failure on customer CE router link', delay: 1400 },
      { text: '[00:01.90] [AUTOMATION] Re-keyed GVPN OSPF area authentication; isolated unauthenticated neighbor', delay: 1950, color: '#10B981' },
      { text: '[00:02.40] [SEVONE_VERIFY] GVPN customer VRF route table stabilized; 100% MPLS encapsulation integrity', delay: 2450, color: '#34D399' },
      { text: '[00:02.85] [SERVICENOW_API] SEC-INC0949212 marked Resolved with root-cause authentication trace attached', delay: 2900, color: '#10B981' },
    ],
  },
  {
    id: 'soc-bgp-5-adjchange',
    category: 'SOC',
    title: 'SOC: BGP-5-ADJCHANGE (Carrier Peer Drop on AS6453)',
    device: 'as6453-edge01.nyc.tatacommunications.net',
    metric: 'BGP-5-ADJCHANGE Syslog',
    targetThreshold: 'Neighbor Down / Peer Closed Connection',
    severity: 'P1-Critical',
    ticketId: 'SEC-INC0949223',
    rawPayload: {
      endpoint: 'https://tatacommunications.service-now.com/api/now/table/incident',
      method: 'POST',
      body: {
        caller_id: 'auto.soc@tatacommunications.net',
        category: 'Tier-1 BGP Peering Security',
        cmdb_ci: 'as6453-edge01.nyc.tatacommunications.net',
        short_description: 'Auto-Remediated: BGP-5-ADJCHANGE neighbor reset and automated failover on AS6453',
        state: '6 - Resolved',
      },
    },
    logs: [
      { text: '[00:00.12] [BGP Syslog] %BGP-5-ADJCHANGE: neighbor 192.168.10.2 Down - Peer closed connection', delay: 100, color: '#EF4444' },
      { text: '[00:00.40] [DISHA / Assure1] BGP-5-ADJCHANGE critical alarm on AS6453 Tier-1 trans-Atlantic peer', delay: 450, color: '#EF4444' },
      { text: '[00:00.80] [PYTHON_RUNBOOK] /opt/soc/bgp_adjchange_guard.py --peer=192.168.10.2 triggered', delay: 900, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] Pre-emptively shifted 80 Gbps ingress transit to secondary carrier partner', delay: 1400 },
      { text: '[00:01.80] [AUTOMATION] Initiated soft BGP reset and verified MD5 password handshake with peer', delay: 1900, color: '#10B981' },
      { text: '[00:02.30] [SEVONE_VERIFY] BGP state transitioned to ESTABLISHED (Prefixes received: 940,210)', delay: 2400, color: '#34D399' },
      { text: '[00:02.80] [SERVICENOW_API] SEC-INC0949223 ticket generated and marked Resolved with SLA met 100%', delay: 2850, color: '#10B981' },
    ],
  },
];

export function EnterpriseIncidentSimulator() {
  const t = useTheme();
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOC' | 'SOC'>('ALL');
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [incidentState, setIncidentState] = useState<'idle' | 'triggered' | 'remediating' | 'resolved'>('idle');
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [showArchitectureNotice, setShowArchitectureNotice] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const filteredScenarios = SCENARIOS.filter((s) => {
    if (activeTab === 'ALL') return true;
    return s.category === activeTab;
  });

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleTrigger = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveLogs([]);
    setIncidentState('triggered');

    scenario.logs.forEach((logItem, index) => {
      setTimeout(() => {
        setActiveLogs((prev) => [...prev, logItem.text]);
        if (index === 2) setIncidentState('remediating');
        if (index === scenario.logs.length - 1) {
          setIsRunning(false);
          setIncidentState('resolved');
        }
      }, logItem.delay);
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [activeLogs]);

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {/* Header & Architecture Notice Button */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.liveText, { color: '#10B981' }]}>
              ENTERPRISE TELECOM NOC / SOC OPERATIONS SIMULATOR
            </Text>
          </View>
          <Text style={[styles.mainHeading, { color: t.text }]}>
            MasterCom & Tata Communications Network Automation Playground
          </Text>
          <Text style={[styles.subHeading, { color: t.muted }]}>
            Simulate real enterprise telecom alarms (DeviceUpDown, InterfaceUpDown, NNI LAG Down, LINK-3, Drivelink, JuniperLink, IIL, GVPN & BGP-5-ADJCHANGE) with automated Python SSH runbooks and ServiceNow SLA ticket resolution.
          </Text>
        </View>

        {/* Question Explainer Banner Toggle */}
        <Pressable
          onPress={() => setShowArchitectureNotice((prev) => !prev)}
          style={[styles.architectureNoticeToggle, { backgroundColor: t.navActive, borderColor: t.accent }]}>
          <Text style={{ fontSize: 13 }}>ℹ️</Text>
          <Text style={[styles.architectureNoticeToggleText, { color: t.accent }]}>
            Does this create live ServiceNow tickets? (Click for Architecture Info)
          </Text>
        </Pressable>
      </View>

      {/* Explainer Notice Box */}
      {showArchitectureNotice && (
        <View style={[styles.noticeBox, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <Text style={[styles.noticeTitle, { color: t.accent }]}>
            💡 Production Reality vs. Public Portfolio Sandbox:
          </Text>
          <Text style={[styles.noticeText, { color: t.text }]}>
            • <Text style={{ fontWeight: '800' }}>In Tata Communications Production:</Text> Siva&apos;s Python automation daemons authenticate to Tata Communications&apos; private internal ServiceNow instance (<Text style={{ fontFamily: 'monospace' }}>https://tatacommunications.service-now.com/api/now/table/incident</Text>) with corporate OAuth2 credentials over secure internal MPLS/VPN carrier networks to create, update, and auto-resolve real P1/P2 tickets under strict client SLAs.
          </Text>
          <Text style={[styles.noticeText, { color: t.text }]}>
            • <Text style={{ fontWeight: '800' }}>In this Public Portfolio Demo:</Text> Because Tata Communications&apos; internal ticketing instance is restricted behind corporate VPNs and enterprise firewalls (to prevent unauthorized external ticket creation and maintain confidentiality), this playground runs in an authentic sandbox showing the <Text style={{ fontWeight: '700' }}>exact live runbook logs, SNMP/NetFlow OIDs, and ServiceNow REST JSON payloads</Text> generated by his scripts.
          </Text>
          <Pressable
            onPress={() => setShowPayloadModal(true)}
            style={[styles.viewPayloadBtn, { backgroundColor: t.accent }]}>
            <Text style={styles.viewPayloadBtnText}>📋 View Exact ServiceNow JSON REST Request Payload</Text>
          </Pressable>
        </View>
      )}

      {/* Filter Tabs: ALL | NOC | SOC */}
      <View style={styles.categoryFilterRow}>
        {(['ALL', 'NOC', 'SOC'] as const).map((cat) => {
          const isSelected = activeTab === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                setActiveTab(cat);
                const first = SCENARIOS.find((s) => cat === 'ALL' || s.category === cat);
                if (first) {
                  setSelectedScenarioId(first.id);
                  setActiveLogs([]);
                  setIncidentState('idle');
                }
              }}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isSelected ? t.accent : t.cardAlt,
                  borderColor: isSelected ? t.accent : t.border,
                },
              ]}>
              <Text
                style={[
                  styles.categoryTabText,
                  { color: isSelected ? '#05070A' : t.muted, fontWeight: isSelected ? '800' : '600' },
                ]}>
                {cat === 'ALL' ? 'All Alarms (10)' : cat === 'NOC' ? '🏢 NOC Alarms (6)' : '🛡️ SOC Alarms (4)'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scenario Selector Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scenarioSelector}>
        {filteredScenarios.map((s) => {
          const isSelected = s.id === selectedScenarioId;
          return (
            <Pressable
              key={s.id}
              disabled={isRunning}
              onPress={() => {
                setSelectedScenarioId(s.id);
                setActiveLogs([]);
                setIncidentState('idle');
              }}
              style={[
                styles.scenarioTab,
                {
                  backgroundColor: isSelected ? t.navActive : t.cardAlt,
                  borderColor: isSelected ? t.accent : t.border,
                },
              ]}>
              <Text
                style={[
                  styles.scenarioTabText,
                  { color: isSelected ? t.accent : t.muted, fontWeight: isSelected ? '800' : '600' },
                ]}>
                {s.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Incident Status Box */}
      <View style={[styles.statusBox, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>TARGET SYSTEM</Text>
          <Text style={[styles.statusValue, { color: t.text }]}>{scenario.device}</Text>
        </View>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>BREACH / ALARM</Text>
          <Text style={[styles.statusValue, { color: '#EF4444' }]}>{scenario.targetThreshold}</Text>
        </View>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>SERVICENOW TICKET</Text>
          <Text style={[styles.statusValue, { color: '#F59E0B' }]}>{scenario.ticketId}</Text>
        </View>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>AUTOMATION STATE</Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.stateDot,
                {
                  backgroundColor:
                    incidentState === 'resolved'
                      ? '#10B981'
                      : incidentState === 'remediating'
                      ? '#38BDF8'
                      : incidentState === 'triggered'
                      ? '#EF4444'
                      : '#94A3B8',
                },
              ]}
            />
            <Text
              style={[
                styles.stateText,
                {
                  color:
                    incidentState === 'resolved'
                      ? '#10B981'
                      : incidentState === 'remediating'
                      ? '#38BDF8'
                      : incidentState === 'triggered'
                      ? '#EF4444'
                      : '#94A3B8',
                },
              ]}>
              {incidentState === 'idle'
                ? 'STANDBY'
                : incidentState === 'triggered'
                ? 'ALARM DETECTED'
                : incidentState === 'remediating'
                ? 'PYTHON RUNBOOK ACTIVE'
                : 'RESOLVED & VERIFIED'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleTrigger}
          disabled={isRunning}
          style={({ pressed }) => [
            styles.triggerBtnWrapper,
            { opacity: pressed || isRunning ? 0.8 : 1, flex: 1 },
          ]}>
          <LinearGradient
            colors={
              isRunning
                ? ['#334155', '#1E293B']
                : incidentState === 'resolved'
                ? ['#059669', '#10B981']
                : ['#E11D48', '#BE123C']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.triggerBtnGradient}>
            <Text style={styles.triggerBtnText}>
              {isRunning
                ? '⚡ Executing Autonomous Self-Healing Runbook...'
                : incidentState === 'resolved'
                ? '✓ Incident Auto-Remediated (Click to Run Again)'
                : `⚡ Trigger ${scenario.category} Alarm Simulation`}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => setShowPayloadModal(true)}
          style={[styles.payloadInspectBtn, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <Text style={[styles.payloadInspectText, { color: t.accent }]}>📋 View ServiceNow JSON</Text>
        </Pressable>
      </View>

      {/* Terminal Console */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <View style={styles.macButtons}>
            <View style={[styles.macDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.macDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.macDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.terminalTitle}>
            SevOne NMS & Python Auto-Remediation Console (Tata Telecom NOC / SOC Operations)
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.terminalBody}
          contentContainerStyle={{ padding: 12, minHeight: 140 }}>
          {activeLogs.length === 0 ? (
            <Text style={styles.idleTerminalText}>
              Console listening... Click &quot;Trigger {scenario.category} Alarm Simulation&quot; above to watch Siva&apos;s automated
              NOC/SOC event detection, SSH runbook execution, and ServiceNow ticket resolution live.
            </Text>
          ) : (
            activeLogs.map((log, i) => (
              <Text key={i} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Raw ServiceNow JSON Payload Modal */}
      {showPayloadModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#090D12', borderColor: t.accent }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: '#FFFFFF' }]}>
                  ServiceNow REST API Request Payload (Production Specification)
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                  POST {scenario.rawPayload.endpoint}
                </Text>
              </View>
              <Pressable onPress={() => setShowPayloadModal(false)} style={styles.modalCloseBtn}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.jsonText}>
                {JSON.stringify(scenario.rawPayload, null, 2)}
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={{ color: '#64748B', fontSize: 11, flex: 1 }}>
                In corporate production, Python daemons send this JSON over internal TLS tunnels with OAuth2 tokens.
              </Text>
              <Pressable
                onPress={() => setShowPayloadModal(false)}
                style={[styles.modalDoneBtn, { backgroundColor: t.accent }]}>
                <Text style={{ color: '#05070A', fontWeight: '800', fontSize: 12 }}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginVertical: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  topRow: {
    marginBottom: 14,
    gap: 10,
  },
  headerLeft: {
    gap: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subHeading: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  architectureNoticeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  architectureNoticeToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noticeBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  viewPayloadBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  viewPayloadBtnText: {
    color: '#05070A',
    fontSize: 11,
    fontWeight: '800',
  },
  categoryFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
  },
  scenarioSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  scenarioTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  scenarioTabText: {
    fontSize: 13,
  },
  statusBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusCol: {
    minWidth: 130,
    gap: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  triggerBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  triggerBtnGradient: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  payloadInspectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payloadInspectText: {
    fontSize: 12,
    fontWeight: '800',
  },
  terminalContainer: {
    borderRadius: 12,
    backgroundColor: '#090D12',
    borderWidth: 1,
    borderColor: '#1D2731',
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#05070A',
    borderBottomWidth: 1,
    borderBottomColor: '#1D2731',
    gap: 10,
  },
  macButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  macDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    color: '#8AA9D8',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  terminalBody: {
    maxHeight: 220,
  },
  idleTerminalText: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  logText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 19,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1D2731',
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 260,
    backgroundColor: '#05070A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D2731',
  },
  jsonText: {
    color: '#34D399',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  modalDoneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
