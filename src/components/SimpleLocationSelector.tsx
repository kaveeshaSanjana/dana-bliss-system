import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Province enum
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

// District enum
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

// Display names for provinces
const provinceDisplayNames: Record<Province, string> = {
  [Province.WESTERN]: "Western",
  [Province.CENTRAL]: "Central",
  [Province.SOUTHERN]: "Southern",
  [Province.NORTHERN]: "Northern",
  [Province.EASTERN]: "Eastern",
  [Province.NORTH_WESTERN]: "North Western",
  [Province.NORTH_CENTRAL]: "North Central",
  [Province.UVA]: "Uva",
  [Province.SABARAGAMUWA]: "Sabaragamuwa",
};

// Display names for districts
const districtDisplayNames: Record<District, string> = {
  [District.COLOMBO]: "Colombo",
  [District.GAMPAHA]: "Gampaha",
  [District.KALUTARA]: "Kalutara",
  [District.KANDY]: "Kandy",
  [District.MATALE]: "Matale",
  [District.NUWARA_ELIYA]: "Nuwara Eliya",
  [District.GALLE]: "Galle",
  [District.MATARA]: "Matara",
  [District.HAMBANTOTA]: "Hambantota",
  [District.JAFFNA]: "Jaffna",
  [District.KILINOCHCHI]: "Kilinochchi",
  [District.MANNAR]: "Mannar",
  [District.MULLAITIVU]: "Mullaitivu",
  [District.VAVUNIYA]: "Vavuniya",
  [District.TRINCOMALEE]: "Trincomalee",
  [District.BATTICALOA]: "Batticaloa",
  [District.AMPARA]: "Ampara",
  [District.KURUNEGALA]: "Kurunegala",
  [District.PUTTALAM]: "Puttalam",
  [District.ANURADHAPURA]: "Anuradhapura",
  [District.POLONNARUWA]: "Polonnaruwa",
  [District.BADULLA]: "Badulla",
  [District.MONARAGALA]: "Monaragala",
  [District.RATNAPURA]: "Ratnapura",
  [District.KEGALLE]: "Kegalle",
};

interface SimpleLocationSelectorProps {
  province: string;
  district: string;
  city: string;
  postalCode: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  disabled?: boolean;
  errors?: {
    province?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  };
}

export const SimpleLocationSelector = ({
  province,
  district,
  city,
  postalCode,
  onProvinceChange,
  onDistrictChange,
  onCityChange,
  onPostalCodeChange,
  disabled = false,
  errors = {}
}: SimpleLocationSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2" id="field-province">
        <div className="flex items-center justify-between">
          <Label htmlFor="province" className={cn(errors.province && "text-destructive")}>
            Province <span className="text-destructive">*</span>
          </Label>
        </div>
        <Select 
          value={province} 
          onValueChange={onProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "bg-background/50 border-border/50",
            errors.province && "border-destructive ring-2 ring-destructive/20"
          )}>
            <SelectValue placeholder="Select province" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border">
            {Object.values(Province).map((prov) => (
              <SelectItem key={prov} value={prov}>
                {provinceDisplayNames[prov]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.province && (
          <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.province}
          </p>
        )}
      </div>

      <div className="space-y-2" id="field-district">
        <div className="flex items-center justify-between">
          <Label htmlFor="district" className={cn(errors.district && "text-destructive")}>
            District <span className="text-destructive">*</span>
          </Label>
        </div>
        <Select 
          value={district} 
          onValueChange={onDistrictChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "bg-background/50 border-border/50",
            errors.district && "border-destructive ring-2 ring-destructive/20"
          )}>
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border max-h-60">
            {Object.values(District).map((dist) => (
              <SelectItem key={dist} value={dist}>
                {districtDisplayNames[dist]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.district && (
          <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.district}
          </p>
        )}
      </div>

      <div className="space-y-2" id="field-city">
        <div className="flex items-center justify-between">
          <Label htmlFor="city" className={cn(errors.city && "text-destructive")}>
            City <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">{city.length}/50</span>
        </div>
        <Input
          id="city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className={cn(
            "bg-background/50 border-border/50",
            errors.city && "border-destructive ring-2 ring-destructive/20"
          )}
          placeholder="Enter city name"
          disabled={disabled}
          maxLength={50}
        />
        {errors.city && (
          <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.city}
          </p>
        )}
      </div>

      <div className="space-y-2" id="field-postalCode">
        <div className="flex items-center justify-between">
          <Label htmlFor="postalCode" className={cn(errors.postalCode && "text-destructive")}>
            Postal Code
          </Label>
          <span className="text-xs text-muted-foreground">{postalCode.length}/10</span>
        </div>
        <Input
          id="postalCode"
          value={postalCode}
          onChange={(e) => onPostalCodeChange(e.target.value)}
          className={cn(
            "bg-background/50 border-border/50",
            errors.postalCode && "border-destructive ring-2 ring-destructive/20"
          )}
          placeholder="Enter postal code"
          disabled={disabled}
          maxLength={10}
        />
        {errors.postalCode && (
          <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.postalCode}
          </p>
        )}
      </div>
    </div>
  );
};
