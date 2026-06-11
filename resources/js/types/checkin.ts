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

export interface Job {
    id: string;
    customer: string;
    vehicle: string;
    color: string;
    plate: string;
    service: string;
}

export interface CheckinProps {
    jobId: string;
    job: Job;
    existingCheckinData?: CheckinData | null;
}
