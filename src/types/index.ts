export type WasteCategory = 'recyclable' | 'organic' | 'hazardous' | 'landfill';

export type ScanType = 'live_ai' | 'sample_demo';

export interface WasteAnalysisResult {
  id: string;
  timestamp: string;
  itemName: string;
  category: WasteCategory;
  categoryLabel: string;
  confidence: number; // e.g. 96 (%)
  material: string;
  recyclability: 'High' | 'Medium' | 'Low' | 'Non-recyclable';
  carbonOffsetEstimate: string; // e.g. "0.35 kg CO₂ saved"
  disposalSteps: string[];
  preparationTips: string[];
  upcyclingIdeas: string[];
  imageUrl?: string;
  notes?: string;
  scanType?: ScanType;
  isRealAiScan?: boolean;
  sourceModel?: string;
  hasThumbnail?: boolean;
  s3Key?: string;
  s3Bucket?: string;
  s3Region?: string;
}

export interface WasteScanRecord extends WasteAnalysisResult {
  scanDate: string;
  hasThumbnail?: boolean;
}

export interface SaveScanResult {
  success: boolean;
  records: WasteScanRecord[];
  error?: string;
  code?: 'QUOTA_EXCEEDED' | 'STORAGE_ERROR' | 'DUPLICATE' | 'INVALID_DATA';
  isDuplicate?: boolean;
}

export interface AwsStatus {
  configured: boolean;
  bucket?: string;
  region?: string;
  message?: string;
}

export interface ApiStatusResponse {
  configured: boolean;
  model: string;
  provider: string;
  message: string;
  aws?: AwsStatus;
}

export interface AnalysisApiResponse {
  success: boolean;
  data?: WasteAnalysisResult;
  error?: string;
  message?: string;
  code?: 'API_KEY_NOT_CONFIGURED' | 'ANALYSIS_FAILED' | 'INVALID_IMAGE' | 'SERVER_ERROR';
}

export interface UploadApiResponse {
  success: boolean;
  s3Key?: string;
  presignedUrl?: string;
  bucket?: string;
  region?: string;
  error?: string;
  code?: 'AWS_NOT_CONFIGURED' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED';
  message?: string;
}
