export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type ReportCategory =
  | 'POTHOLE'
  | 'ROAD_DAMAGE'
  | 'SIDEWALK'
  | 'GARBAGE'
  | 'SIGNAGE'
  | 'ACCESSIBILITY'
  | 'OTHER';

export type ReportStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type LocationType = 'GPS' | 'MAP' | 'NONE';

export type AccessibilityBarrierType =
  | 'STAIRS'
  | 'RAMP'
  | 'ELEVATOR'
  | 'NARROW_DOOR'
  | 'BLOCKED_SIDEWALK'
  | 'OBSTACLE'
  | 'INACCESSIBLE_ENTRANCE'
  | 'WHEELCHAIR_ROUTE_BARRIER'
  | 'NONE';

export interface BBoxDict {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface YOLODetectionItem {
  class_name: string;
  confidence: number;
  bbox: BBoxDict;
  area_ratio?: number;
}

export interface AIDetectionResponse {
  success: boolean;
  category: string;
  defect?: string;
  confidence: number;
  severity: string;
  severity_score: number;
  severity_reasons: string[];
  image_width?: number;
  image_height?: number;
  detections: YOLODetectionItem[];
  message?: string;
}

export interface Evidence {
  id: number;
  report_id: number;
  file_path: string;
  filename: string;
  file_size?: number;
  mime_type?: string;
  confidence: number;
  capture_source?: string;
  file_hash?: string;
  has_gps_metadata?: boolean;
  evidence_confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_reasons?: string;
  ai_detections?: string;
  created_at: string;
}

export interface Report {
  id: number;
  case_id?: string;
  defect_type?: string;
  ai_confidence?: number;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  location_type: LocationType;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  
  // Human Impact Engine (0 - 100)
  human_impact_score: number;
  priority_level: PriorityLevel;
  severity: string;
  impact_notes?: string | null;
  factor_breakdown?: string | null;
  reasons?: string | null;

  // Accessibility & Context
  accessibility_barrier?: AccessibilityBarrierType | string | null;
  affects_mobility_impaired: boolean;
  location_context?: string | null;

  // Infrastructure Memory
  is_repeated_issue: boolean;
  repeat_count: number;
  is_demo_data: boolean;

  reporter_id: number;
  created_at: string;
  updated_at: string;
  reporter?: User;
  evidence: Evidence[];
}

export interface HighImpactLocationItem {
  id: number;
  title: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  impact_score: number;
  priority: string;
  category: string;
}

export interface DashboardStats {
  total_reports: number;
  open_reports: number;
  under_review_reports: number;
  assigned_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  rejected_reports: number;
  critical_reports: number;
  high_impact_count: number;
  average_impact_score: number;
  accessibility_issue_count: number;
  repeated_issue_count: number;
  category_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  high_impact_locations: HighImpactLocationItem[];
}

export interface ImpactForecastTimeline {
  timeframe: string;
  impact_description: string;
  disruption_level: string;
}

export interface ImpactForecast {
  title: string;
  disclaimer: string;
  current_affected_estimate: string;
  timeline: ImpactForecastTimeline[];
  compounding_risks: string[];
}

export interface ImpactFactors {
  severity: number;
  pedestrian_impact: number;
  accessibility_impact: number;
  location_context: number;
  history: number;
}

export interface RepairSimulationResult {
  current_impact_score: number;
  current_priority: string;
  current_factors: ImpactFactors;
  simulated_impact_score: number;
  simulated_priority: string;
  simulated_factors: ImpactFactors;
  impact_reduction_points: number;
  percentage_improvement: number;
  accessibility_restored: boolean;
  summary_message: string;
  disclaimer: string;
}

export interface MunicipalWorkOrder {
  work_order_id: string;
  generated_at: string;
  target_sla_hours: number;
  assigned_department: string;
  issue_title: string;
  category: string;
  status: string;
  priority: string;
  human_impact_score: number;
  severity: string;
  accessibility_barrier: string;
  location_summary: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  recommended_action: string;
  equipment_needed: string[];
  report_history_note: string;
  evidence_urls: string[];
}
