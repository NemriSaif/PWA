
export class CreateVehiculeDto {
  readonly immatriculation: string;
  readonly marque?: string;
  readonly modele?: string;
  readonly type?: string;
  readonly kilometrage?: number;
}
