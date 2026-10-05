/** Entidade de domínio: grande período (Colônia, Império, República). */
export class Period {
  constructor({ id, name, startYear, endYear = null, description = '' }) {
    this.id = id;
    this.name = name;
    this.startYear = startYear;
    this.endYear = endYear;
    this.description = description;
    this.phases = [];
    Object.seal(this);
  }

  get yearsLabel() {
    return `${this.startYear} – ${this.endYear ?? 'Presente'}`;
  }

  static fromDTO(dto) {
    return new Period(dto);
  }
}
