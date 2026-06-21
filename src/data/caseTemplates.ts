/**
 * Built-in investigation templates. Each one offers practical starting guidance
 * for a common SOC case type: what evidence to collect, starter analyst
 * questions, expected timeline checkpoints, possible ATT&CK techniques, findings
 * to validate, and closure considerations. Synthetic and fully editable once a
 * case is created — they are a starting point, not a prescription.
 */

export interface TemplateQuestion {
  question: string
  rationale?: string
}

export interface TemplateMitre {
  techniqueId: string
  techniqueName: string
  tactic: string
  rationale?: string
}

export interface CaseTemplate {
  id: string
  name: string
  description: string
  evidenceChecklist: string[]
  analystQuestions: TemplateQuestion[]
  timelineCheckpoints: string[]
  mitreTechniques: TemplateMitre[]
  suggestedFindings: string[]
  closureConsiderations: string[]
}

export const caseTemplates: CaseTemplate[] = [
  {
    id: 'phishing',
    name: 'Phishing / Suspicious Email',
    description: 'A reported or detected suspicious email, possibly with a link or attachment.',
    evidenceChecklist: [
      'Full email headers (sender, SPF/DKIM/DMARC, routing)',
      'Email body, URLs, and attachments (defanged)',
      'Attachment hashes and sandbox / AV verdict',
      'Email gateway / quarantine logs',
      'Recipient list and click / open telemetry',
    ],
    analystQuestions: [
      { question: 'Did SPF / DKIM / DMARC pass or fail?' },
      { question: 'Did any recipient click the link or open the attachment?' },
      { question: 'Is the sender domain newly registered or a look-alike?' },
      { question: 'Were any credentials submitted to a phishing page?' },
    ],
    timelineCheckpoints: [
      'Email delivered',
      'User opened email / clicked link',
      'Attachment opened or credentials submitted',
      'Any follow-on activity (sign-in, execution)',
    ],
    mitreTechniques: [
      { techniqueId: 'T1566.001', techniqueName: 'Phishing: Spearphishing Attachment', tactic: 'Initial Access' },
      { techniqueId: 'T1566.002', techniqueName: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
      { techniqueId: 'T1204.002', techniqueName: 'User Execution: Malicious File', tactic: 'Execution' },
    ],
    suggestedFindings: [
      'Determine whether the email is malicious, spam, or benign',
      'Confirm whether any user interacted (clicked / opened)',
      'Assess whether credentials or hosts were compromised',
    ],
    closureConsiderations: [
      'Block sender / domain and purge from other mailboxes',
      'Reset credentials if a phishing page was submitted',
      'Classify the case and note any user-awareness follow-up',
    ],
  },
  {
    id: 'powershell',
    name: 'Suspicious PowerShell Execution',
    description: 'PowerShell spawned with a suspicious or encoded command, often from another process.',
    evidenceChecklist: [
      'Process tree (parent → powershell.exe)',
      'Full command line / decoded -enc payload',
      'Script block logging (Event ID 4104)',
      'Outbound network connections from the process',
      'Files written or downloaded by the process',
    ],
    analystQuestions: [
      { question: 'What is the parent process (Office, scheduled task, service)?' },
      { question: 'Does the decoded command download or execute a payload?' },
      { question: 'Did the process make outbound connections, and did they succeed?' },
      { question: 'Is this expected admin / automation activity?' },
    ],
    timelineCheckpoints: [
      'Parent process started',
      'PowerShell spawned with suspicious command',
      'Outbound connection / download attempt',
      'Detection raised',
      'Triage / containment',
    ],
    mitreTechniques: [
      { techniqueId: 'T1059.001', techniqueName: 'Command and Scripting Interpreter: PowerShell', tactic: 'Execution' },
      { techniqueId: 'T1105', techniqueName: 'Ingress Tool Transfer', tactic: 'Command and Control' },
      { techniqueId: 'T1047', techniqueName: 'Windows Management Instrumentation', tactic: 'Execution' },
    ],
    suggestedFindings: [
      'Confirm whether execution was malicious or legitimate admin activity',
      'Determine if a payload was retrieved or executed',
      'Scope other hosts showing the same pattern',
    ],
    closureConsiderations: [
      'Isolate the host if malicious execution is confirmed',
      'Block command-and-control indicators',
      'Document the parent-child pattern for detection tuning',
    ],
  },
  {
    id: 'impossible-travel',
    name: 'Impossible Travel / Suspicious Login',
    description: 'Sign-ins from distant locations in a short window, flagged as impossible travel.',
    evidenceChecklist: [
      'Sign-in logs for both locations (IP, geo, timestamp)',
      'MFA result and method for each sign-in',
      'Device compliance / known-device status',
      'IP reputation and VPN / proxy egress check',
      'Post-login audit (mailbox rules, downloads, role changes)',
    ],
    analystQuestions: [
      { question: 'Are the sign-in IPs known corporate VPN egress points?' },
      { question: 'Did MFA succeed legitimately (no fatigue / bombing)?' },
      { question: 'Is travel between the two locations physically plausible?' },
      { question: 'Was there any anomalous post-login activity?' },
    ],
    timelineCheckpoints: [
      'First sign-in (location A)',
      'Second sign-in (location B)',
      'Impossible-travel alert raised',
      'IP correlated to VPN / threat intel',
      'Post-login activity reviewed',
    ],
    mitreTechniques: [
      { techniqueId: 'T1078', techniqueName: 'Valid Accounts', tactic: 'Initial Access' },
      { techniqueId: 'T1110', techniqueName: 'Brute Force', tactic: 'Credential Access' },
    ],
    suggestedFindings: [
      'Explain the geo anomaly (VPN, real travel, or compromise)',
      'Confirm whether the account is compromised',
      'Identify any persistence (mailbox rules, OAuth grants)',
    ],
    closureConsiderations: [
      'Allowlist known VPN egress to reduce false positives',
      'Revoke sessions / reset credentials if compromised',
      'Classify and document the outcome',
    ],
  },
  {
    id: 'malware',
    name: 'Malware / EDR Alert',
    description: 'An endpoint detection for a suspicious or malicious file.',
    evidenceChecklist: [
      'Alerting file path and SHA-256 hash',
      'AV / EDR detection name and verdict',
      'Process tree and execution chain',
      'Persistence mechanisms (run keys, tasks, services)',
      'Network connections and dropped files',
    ],
    analystQuestions: [
      { question: 'Is the file hash known-malicious in threat intel?' },
      { question: 'Did the malware execute, or was it blocked / quarantined?' },
      { question: 'Are there persistence mechanisms present?' },
      { question: 'How did the file arrive on the host?' },
    ],
    timelineCheckpoints: [
      'File delivered / written to disk',
      'Execution attempt',
      'EDR detection / quarantine',
      'Persistence or lateral movement (if any)',
      'Containment',
    ],
    mitreTechniques: [
      { techniqueId: 'T1204.002', techniqueName: 'User Execution: Malicious File', tactic: 'Execution' },
      { techniqueId: 'T1547.001', techniqueName: 'Registry Run Keys / Startup Folder', tactic: 'Persistence' },
      { techniqueId: 'T1071.001', techniqueName: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
    ],
    suggestedFindings: [
      'Confirm whether the malware executed successfully',
      'Identify persistence and the scope of infection',
      'Determine the initial access vector',
    ],
    closureConsiderations: [
      'Isolate and reimage if execution is confirmed',
      'Block indicators (hash, C2) at the perimeter',
      'Hunt for the same hash across the fleet',
    ],
  },
  {
    id: 'brute-force',
    name: 'Brute Force Followed by Successful Login',
    description: 'Many failed sign-ins followed by a successful authentication for the same account.',
    evidenceChecklist: [
      'Failed sign-in count, source IPs, and timeframe',
      'The successful sign-in (IP, geo, MFA result)',
      'Targeted account(s) and whether they are privileged',
      'IP reputation / known-bad lists',
      'Post-login activity for the successful sign-in',
    ],
    analystQuestions: [
      { question: 'How many failed attempts preceded success, and over what window?' },
      { question: 'Did the successful login satisfy MFA?' },
      { question: 'Is the source IP known-malicious or anonymizing?' },
      { question: 'Was the targeted account privileged?' },
    ],
    timelineCheckpoints: [
      'Brute-force attempts begin',
      'Successful sign-in',
      'Detection raised',
      'Post-login activity reviewed',
      'Containment (reset / block)',
    ],
    mitreTechniques: [
      { techniqueId: 'T1110', techniqueName: 'Brute Force', tactic: 'Credential Access' },
      { techniqueId: 'T1078', techniqueName: 'Valid Accounts', tactic: 'Initial Access' },
    ],
    suggestedFindings: [
      'Confirm whether the successful login is the attacker or legitimate',
      'Assess account compromise and blast radius',
      'Identify any follow-on actions',
    ],
    closureConsiderations: [
      'Reset credentials and revoke sessions if compromised',
      'Block source IPs and repair / enforce MFA',
      'Classify and recommend a lockout-policy review',
    ],
  },
]

export function getCaseTemplate(id: string): CaseTemplate | undefined {
  return caseTemplates.find((template) => template.id === id)
}
