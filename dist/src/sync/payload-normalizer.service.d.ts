export declare class PayloadNormalizerService {
    normalize(entityType: string, payload: any): any;
    private convertDates;
    private convertEnums;
    denormalize(entityType: string, data: any): any;
}
