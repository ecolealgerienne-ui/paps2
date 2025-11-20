export declare const ENUM_MAPPINGS: {
    readonly movement_type: {
        readonly temporaryOut: "temporary_out";
        readonly temporaryReturn: "temporary_return";
        readonly birth: "birth";
        readonly purchase: "purchase";
        readonly sale: "sale";
        readonly death: "death";
        readonly slaughter: "slaughter";
        readonly exit: "exit";
        readonly entry: "entry";
    };
    readonly breeding_method: {
        readonly natural: "natural";
        readonly artificialInsemination: "artificial_insemination";
        readonly embryoTransfer: "embryo_transfer";
    };
    readonly document_type: {
        readonly passport: "passport";
        readonly certificate: "certificate";
        readonly invoice: "invoice";
        readonly transportCert: "transport_cert";
        readonly breedingCert: "breeding_cert";
        readonly vetReport: "vet_report";
        readonly other: "other";
    };
    readonly animal_status: {
        readonly draft: "draft";
        readonly alive: "alive";
        readonly sold: "sold";
        readonly dead: "dead";
        readonly slaughtered: "slaughtered";
        readonly onTemporaryMovement: "on_temporary_movement";
    };
    readonly temporary_type: {
        readonly loan: "loan";
        readonly transhumance: "transhumance";
        readonly boarding: "boarding";
        readonly quarantine: "quarantine";
        readonly exhibition: "exhibition";
    };
};
export declare function convertEnumValue(enumType: keyof typeof ENUM_MAPPINGS, value: string): string;
export declare function convertEnumValueReverse(enumType: keyof typeof ENUM_MAPPINGS, value: string): string;
