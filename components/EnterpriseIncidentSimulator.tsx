import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';

type Scenario = {
  id: string;
  title: string;
  device: string;
  metric: string;
  targetThreshold: string;
  severity: 'P1-Critical' | 'P2-High' | 'P3-Medium';
  ticketId: string;
  logs: { text: string; delay: number; color?: string }[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'packet-loss',
    title: 'High Packet Loss on Core Router',
    device: 'cr01.lon.tatacommunications.net (10.24.1.1)',
    metric: 'Packet Drop Rate',
    targetThreshold: '18.4% (Threshold: 5.0%)',
    severity: 'P2-High',
    ticketId: 'INC0948218',
    logs: [
      { text: '[00:00.12] [SevOne NMS] Ingesting NetFlow & SNMP OID 1.3.6.1.4.1.9.9.109.1.1.1 from 10.24.1.1', delay: 100 },
      { text: '[00:00.35] [THRESHOLD_ENGINE] ALERT: Interface xe-0/0/1 packet drop reached 18.4% (> 5.0% SLA)', delay: 400, color: '#EF4444' },
      { text: '[00:00.60] [DISHA / Assure1] Correlated 48 alarms across London PoP backbone', delay: 800 },
      { text: '[00:00.95] [PYTHON_RUNBOOK] Launching /opt/netauto/remediate_interface.py --target=10.24.1.1', delay: 1300, color: '#38BDF8' },
      { text: '[00:01.40] [AUTOMATION] Initiating SSH session; dumping buffer queues & interface statistics', delay: 1800 },
      { text: '[00:01.90] [AUTOMATION] Flushed corrupted ARP table & rerouted egress traffic to alternate MPLS path', delay: 2300, color: '#10B981' },
      { text: '[00:02.40] [SEVONE_VERIFY] Telemetry re-check: Packet loss dropped to 0.00% (Latency: 14ms)', delay: 2800, color: '#34D399' },
      { text: '[00:02.80] [SERVICENOW_API] POST /api/now/table/incident ➔ Ticket INC0948218 created', delay: 3300, color: '#F59E0B' },
      { text: '[00:03.10] [SERVICENOW_API] Auto-updated status to RESOLVED with full diagnostic RCA logs', delay: 3700, color: '#10B981' },
      { text: '[00:03.30] [SUMMARY] Incident remediated in 3.1s. Operational manual effort reduced by ~35%.', delay: 4100, color: '#7DB9FF' },
    ],
  },
  {
    id: 'slow-query',
    title: 'MySQL Slow Query & Lock Contention',
    device: 'db-bss-prod-02.tatacommunications.net (10.40.8.20)',
    metric: 'SQL Query Latency',
    targetThreshold: '3.82s (Threshold: 1.0s)',
    severity: 'P2-High',
    ticketId: 'INC0948302',
    logs: [
      { text: '[00:00.10] [Spotlight Monitor] Detected 14 blocked threads on cdr_trans_2024 partition', delay: 100 },
      { text: '[00:00.40] [THRESHOLD_ENGINE] Average query response spike: 3.82s (SLA breach > 1.0s)', delay: 450, color: '#EF4444' },
      { text: '[00:00.85] [PYTHON_API] Invoking /opt/dbauto/kill_dormant_locks.py --threshold=3000ms', delay: 900, color: '#38BDF8' },
      { text: '[00:01.30] [AUTOMATION] Identified unindexed sequential scan query from legacy batch worker', delay: 1400 },
      { text: '[00:01.80] [AUTOMATION] Terminated hung PID 49102; activated in-memory Redis query cache', delay: 1900, color: '#10B981' },
      { text: '[00:02.30] [POSTGRES_REINDEX] Applied compound B-Tree index (idx_cdr_trans_device_ts)', delay: 2400 },
      { text: '[00:02.75] [BENCHMARK] Latency re-measured: 3.82s ➔ 0.38s (2.5s+ improvement guaranteed)', delay: 2900, color: '#34D399' },
      { text: '[00:03.10] [SERVICENOW_API] INC0948302 marked Resolved; RCA telemetry attached', delay: 3400, color: '#10B981' },
    ],
  },
  {
    id: 'bgp-flap',
    title: 'BGP Peer Flap & Interface Jitter',
    device: 'as6453-gw02.singapore.tatacommunications.net',
    metric: 'BGP Hold Timer Jitter',
    targetThreshold: '3 Flaps in 60s',
    severity: 'P1-Critical',
    ticketId: 'INC0948419',
    logs: [
      { text: '[00:00.15] [SevOne Trap] BGP-4 Established ➔ OpenConfirm transition flap detected', delay: 100 },
      { text: '[00:00.50] [SEV1_ALERT] High flapping rate detected on AS6453 carrier interconnect', delay: 500, color: '#EF4444' },
      { text: '[00:01.00] [PYTHON_RUNBOOK] /opt/telecom/dampen_bgp_route.py triggered', delay: 1000, color: '#38BDF8' },
      { text: '[00:01.60] [AUTOMATION] Dampened unstable route prefix; isolated peering neighbor 192.168.99.4', delay: 1600, color: '#10B981' },
      { text: '[00:02.10] [TELEMETRY] Convergence stabilized across Singapore PoP in 2.1s', delay: 2100, color: '#34D399' },
      { text: '[00:02.60] [SERVICENOW_API] Dispatched high-priority notification to L2/L3 Carrier NOC', delay: 2600, color: '#F59E0B' },
      { text: '[00:03.00] [STATUS] System auto-remediated; zero customer packet drops recorded', delay: 3000, color: '#10B981' },
    ],
  },
];

export function EnterpriseIncidentSimulator() {
  const t = useTheme();
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [incidentState, setIncidentState] = useState<'idle' | 'triggered' | 'remediating' | 'resolved'>('idle');
  const scrollRef = useRef<ScrollView>(null);

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
      {/* Header Badge */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.liveText, { color: '#10B981' }]}>ENTERPRISE SIMULATOR</Text>
          </View>
          <Text style={[styles.mainHeading, { color: t.text }]}>
            MasterCom & Tata Communications Network Automation Playground
          </Text>
          <Text style={[styles.subHeading, { color: t.muted }]}>
            Experience how Siva&apos;s Python automations monitor 5,000+ SevOne SNMP metrics, execute diagnostic runbooks, and auto-resolve ServiceNow SLA tickets.
          </Text>
        </View>
      </View>

      {/* Scenario Selector Tabs */}
      <View style={styles.scenarioSelector}>
        {SCENARIOS.map((s) => {
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
      </View>

      {/* Incident Metric Dashboard Box */}
      <View style={[styles.statusBox, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>TARGET DEVICE</Text>
          <Text style={[styles.statusValue, { color: t.text }]}>{scenario.device}</Text>
        </View>
        <View style={styles.statusCol}>
          <Text style={[styles.statusLabel, { color: t.muted }]}>BREACH METRIC</Text>
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
                ? 'BREACH DETECTED'
                : incidentState === 'remediating'
                ? 'PYTHON SELF-HEALING'
                : 'RESOLVED & VERIFIED'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleTrigger}
          disabled={isRunning}
          style={({ pressed }) => [
            styles.triggerBtn,
            {
              backgroundColor: isRunning ? t.border : '#EF4444',
              opacity: pressed || isRunning ? 0.75 : 1,
            },
          ]}>
          <Text style={styles.triggerBtnText}>
            {isRunning ? 'Executing Self-Healing Runbook...' : '⚡ Trigger Incident Simulation'}
          </Text>
        </Pressable>
      </View>

      {/* Simulated Terminal Log Console */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <View style={styles.macButtons}>
            <View style={[styles.macDot, { backgroundColor: '#EF4444' }]} />
            <View style={[styles.macDot, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.macDot, { backgroundColor: '#10B981' }]} />
          </View>
          <Text style={styles.terminalTitle}>SevOne NMS & Python Auto-Remediation Console (Tata Telecom NOC)</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.terminalBody}
          contentContainerStyle={{ padding: 12, minHeight: 140 }}>
          {activeLogs.length === 0 ? (
            <Text style={styles.idleTerminalText}>
              Console listening... Click &quot;Trigger Incident Simulation&quot; above to watch Siva&apos;s automated
              event detection, SSH runbook execution, and ServiceNow ticket resolution live.
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
  scenarioSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 14,
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
    marginBottom: 14,
  },
  triggerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
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
});
