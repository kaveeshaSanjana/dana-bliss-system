export enum InstituteType {
  DHAMMA_SCHOOL = 'dhamma_school',
  SCHOOL = 'school',
  PRIMARY_SCHOOL = 'primary_school',
  SECONDARY_SCHOOL = 'secondary_school',
  TUITION_INSTITUTE = 'tuition_institute',
  ONLINE_ACADEMY = 'online_academy',
  PRE_SCHOOL = 'pre_school',
  OTHER = 'other',
}

export enum Country {
  SRI_LANKA = "Sri Lanka",
}

export enum District {
  // Western Province
  COLOMBO = "COLOMBO",
  GAMPAHA = "GAMPAHA",
  KALUTARA = "KALUTARA",

  // Central Province
  KANDY = "KANDY",
  MATALE = "MATALE",
  NUWARA_ELIYA = "NUWARA_ELIYA",

  // Southern Province
  GALLE = "GALLE",
  MATARA = "MATARA",
  HAMBANTOTA = "HAMBANTOTA",

  // Northern Province
  JAFFNA = "JAFFNA",
  KILINOCHCHI = "KILINOCHCHI",
  MANNAR = "MANNAR",
  MULLAITIVU = "MULLAITIVU",
  VAVUNIYA = "VAVUNIYA",

  // Eastern Province
  TRINCOMALEE = "TRINCOMALEE",
  BATTICALOA = "BATTICALOA",
  AMPARA = "AMPARA",

  // North Western Province
  KURUNEGALA = "KURUNEGALA",
  PUTTALAM = "PUTTALAM",

  // North Central Province
  ANURADHAPURA = "ANURADHAPURA",
  POLONNARUWA = "POLONNARUWA",

  // Uva Province
  BADULLA = "BADULLA",
  MONARAGALA = "MONARAGALA",

  // Sabaragamuwa Province
  RATNAPURA = "RATNAPURA",
  KEGALLE = "KEGALLE",
}

export enum Province {
  WESTERN = "WESTERN",
  CENTRAL = "CENTRAL",
  SOUTHERN = "SOUTHERN",
  NORTHERN = "NORTHERN",
  EASTERN = "EASTERN",
  NORTH_WESTERN = "NORTH_WESTERN",
  NORTH_CENTRAL = "NORTH_CENTRAL",
  UVA = "UVA",
  SABARAGAMUWA = "SABARAGAMUWA",
}

// Helper to get display name for Institute Type
export const instituteTypeLabels: Record<InstituteType, string> = {
  [InstituteType.DHAMMA_SCHOOL]: 'Dhamma School',
  [InstituteType.SCHOOL]: 'School',
  [InstituteType.PRIMARY_SCHOOL]: 'Primary School',
  [InstituteType.SECONDARY_SCHOOL]: 'Secondary School',
  [InstituteType.TUITION_INSTITUTE]: 'Tuition Institute',
  [InstituteType.ONLINE_ACADEMY]: 'Online Academy',
  [InstituteType.PRE_SCHOOL]: 'Pre School',
  [InstituteType.OTHER]: 'Other',
};

// Helper to get display name for Province
export const provinceLabels: Record<Province, string> = {
  [Province.WESTERN]: 'Western',
  [Province.CENTRAL]: 'Central',
  [Province.SOUTHERN]: 'Southern',
  [Province.NORTHERN]: 'Northern',
  [Province.EASTERN]: 'Eastern',
  [Province.NORTH_WESTERN]: 'North Western',
  [Province.NORTH_CENTRAL]: 'North Central',
  [Province.UVA]: 'Uva',
  [Province.SABARAGAMUWA]: 'Sabaragamuwa',
};

// Helper to get display name for District
export const districtLabels: Record<District, string> = {
  [District.COLOMBO]: 'Colombo',
  [District.GAMPAHA]: 'Gampaha',
  [District.KALUTARA]: 'Kalutara',
  [District.KANDY]: 'Kandy',
  [District.MATALE]: 'Matale',
  [District.NUWARA_ELIYA]: 'Nuwara Eliya',
  [District.GALLE]: 'Galle',
  [District.MATARA]: 'Matara',
  [District.HAMBANTOTA]: 'Hambantota',
  [District.JAFFNA]: 'Jaffna',
  [District.KILINOCHCHI]: 'Kilinochchi',
  [District.MANNAR]: 'Mannar',
  [District.MULLAITIVU]: 'Mullaitivu',
  [District.VAVUNIYA]: 'Vavuniya',
  [District.TRINCOMALEE]: 'Trincomalee',
  [District.BATTICALOA]: 'Batticaloa',
  [District.AMPARA]: 'Ampara',
  [District.KURUNEGALA]: 'Kurunegala',
  [District.PUTTALAM]: 'Puttalam',
  [District.ANURADHAPURA]: 'Anuradhapura',
  [District.POLONNARUWA]: 'Polonnaruwa',
  [District.BADULLA]: 'Badulla',
  [District.MONARAGALA]: 'Monaragala',
  [District.RATNAPURA]: 'Ratnapura',
  [District.KEGALLE]: 'Kegalle',
};

// Map districts to their provinces
export const districtToProvince: Record<District, Province> = {
  [District.COLOMBO]: Province.WESTERN,
  [District.GAMPAHA]: Province.WESTERN,
  [District.KALUTARA]: Province.WESTERN,
  [District.KANDY]: Province.CENTRAL,
  [District.MATALE]: Province.CENTRAL,
  [District.NUWARA_ELIYA]: Province.CENTRAL,
  [District.GALLE]: Province.SOUTHERN,
  [District.MATARA]: Province.SOUTHERN,
  [District.HAMBANTOTA]: Province.SOUTHERN,
  [District.JAFFNA]: Province.NORTHERN,
  [District.KILINOCHCHI]: Province.NORTHERN,
  [District.MANNAR]: Province.NORTHERN,
  [District.MULLAITIVU]: Province.NORTHERN,
  [District.VAVUNIYA]: Province.NORTHERN,
  [District.TRINCOMALEE]: Province.EASTERN,
  [District.BATTICALOA]: Province.EASTERN,
  [District.AMPARA]: Province.EASTERN,
  [District.KURUNEGALA]: Province.NORTH_WESTERN,
  [District.PUTTALAM]: Province.NORTH_WESTERN,
  [District.ANURADHAPURA]: Province.NORTH_CENTRAL,
  [District.POLONNARUWA]: Province.NORTH_CENTRAL,
  [District.BADULLA]: Province.UVA,
  [District.MONARAGALA]: Province.UVA,
  [District.RATNAPURA]: Province.SABARAGAMUWA,
  [District.KEGALLE]: Province.SABARAGAMUWA,
};
