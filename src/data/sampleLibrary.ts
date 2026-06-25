/**
 * Curated sample cases for the guided demo. These reference the bundled demo
 * cases (which also seed the workspace on first run) by id, with the friendly
 * names used in the Sample Cases library. Synthetic data only.
 */
export interface SampleEntry {
  caseId: string
  name: string
}

export const sampleLibrary: SampleEntry[] = [
  { caseId: 'case-ps-outlook', name: 'Phishing to PowerShell Execution' },
  { caseId: 'case-impossible-travel', name: 'Impossible Travel / Suspicious Login' },
  { caseId: 'case-malware-edr', name: 'Malware / EDR Alert' },
  { caseId: 'case-suspicious-admin', name: 'Suspicious Admin Activity' },
  { caseId: 'case-cloud-exfil-sharing', name: 'Data Exfiltration / Cloud Sharing' },
]
