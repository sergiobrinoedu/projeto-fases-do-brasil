/**
 * Entidade de domínio: uma fase da História do Brasil.
 * Imutável (Value Object) e sem dependência de DOM ou rede.
 */
export class Phase {
  constructor({
    id, order, period, title, subtitle = '', startYear, endYear = null,
    summary = '', description = [], highlights = [], art = 'ship', images = [],
  }) {
    this.id = id;
    this.order = order;
    this.period = period;
    this.title = title;
    this.subtitle = subtitle;
    this.startYear = startYear;
    this.endYear = endYear; // null = "Presente"
    this.summary = summary;
    this.description = description;
    this.highlights = highlights;
    this.art = art;
    this.images = images; // URLs reais opcionais (public/images/...)
    Object.freeze(this);
  }

  get yearsLabel() {
    return `${this.startYear} – ${this.endYear ?? 'Presente'}`;
  }

  /** Factory: cria a entidade a partir de um DTO (API ou arquivo local). */
  static fromDTO(dto) {
    return new Phase(dto);
  }
}
