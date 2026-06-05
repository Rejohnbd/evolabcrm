export interface Photo {
    id?: number;
    data: string;
    timestamp: number;
}

export interface ProgressNote {
    text: string;
    timestamp: number;
    author?: string;
}

export interface Job {
    id: string;
    customer: string;
    vehicle: string;
    color: string;
    plate: string;
    service: string;
}

export interface JobProps {
    job: Job;
    checkinData?: any;
    afterPhotos?: Photo[];
    progressNotes?: ProgressNote[];
    startTime?: number;
    now?: number;
}
