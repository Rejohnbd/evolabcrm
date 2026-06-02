export interface Photo {
    data: string;
    timestamp: number;
}

export interface DamageNote {
    location: string;
    description: string;
    timestamp: number;
}

export interface CheckinData {
    mileage: string;
    fuelLevel: string;
    keysReceived: boolean | null;
    keyCount: string;
    personalItems: string;
    exteriorPhotos: Photo[];
    interiorPhotos: Photo[];
    damageNotes: DamageNote[];
    customerExpectations: string;
}

export interface ProgressNote {
    text: string;
    timestamp: number;
    author?: string;
}

export interface Job {
    id: string;
    customer: string;
    phone: string;
    vehicle: string;
    color: string;
    plate: string;
    service: string;
    notes: string;
    source: 'Retail' | 'Dealer';
    status:
        | 'pending'
        | 'assigned'
        | 'in_progress'
        | 'awaiting_validation'
        | 'completed'
        | 'rework';
    priority: 'normal' | 'high';
    dueDate: string;
    startedBy?: string;
    startedAt?: number;
    duration?: number;
    rejectionReason?: string;
    checkin?: CheckinData;
    afterPhotos?: Photo[];
    progressNotes?: ProgressNote[];
}

export interface ShiftData {
    punched_in: boolean;
    punch_time: number | null;
    punch_in_at?: string;
    punch_out_at?: string;
    total_duration?: number;
}

export interface TechnicianDashboardProps {
    pendingJobs?: Job[];
    myJobs?: Job[];
    completedJobs?: Job[];
    activeJob?: Job | null;
    shift?: ShiftData;
    now?: number;
}
