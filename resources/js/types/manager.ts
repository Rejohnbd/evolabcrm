export interface Photo {
    id?: number;
    data: string;
    timestamp: number;
    type?: string;
}

export interface DamageNote {
    location: string;
    description: string;
    timestamp: number;
}

export interface CheckinData {
    mileage: string;
    fuelLevel: string;
    keysReceived: boolean;
    keyCount: string;
    personalItems?: string;
    damageNotes?: DamageNote[];
    customerExpectations?: string;
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
    status: string;
    priority: 'normal' | 'high';
    dueDate: string;
    startedBy?: string;
    startedAt?: number;
    duration?: number;
    rejectionReason?: string;
    checkin?: CheckinData;
    beforePhotos?: Photo[];
    afterPhotos?: Photo[];
}

export interface Stats {
    awaiting: number;
    inProgress: number;
    pending: number;
    completed: number;
}

export interface ManagerProps {
    jobs: Job[];
    user: { name: string; role: string };
    stats: Stats;
    recentJobs: Job[];
    now: number;
}
