import $ from 'jquery';

/**
 * Botão "Reiniciar" (canto superior esquerdo). Apaga os cards lidos deste navegador
 * (localStorage + cookie fdb_progress — quem trata isso é o ProgressService).
 * Dois toques: o primeiro pede confirmação, o segundo reinicia (sem janelas do navegador).
 */
export class ResetButton {
  #timer = 0;
  #onReset = () => {};

  constructor() {
    this.$el = $(`
      <button type="button" class="reset-fab" aria-label="Reiniciar progresso de leitura" disabled>
        <span class="reset-fab__icon" aria-hidden="true">↺</span>
        <span class="reset-fab__label">Reiniciar</span>
      </button>`).appendTo('body');
    this.$label = this.$el.find('.reset-fab__label');
    this.$el.on('click', () => this.#click());
    $(document).on('keydown', (e) => { if (e.key === 'Escape') this.#disarm(); });
    $(document).on('click', (e) => { if (!$(e.target).closest('.reset-fab').length) this.#disarm(); });
  }

  onReset(cb) { this.#onReset = cb; }

  /** Habilita só quando existe algo lido para limpar. */
  update(progress) {
    const has = progress.readCount > 0 || progress.current > 0;
    this.$el.prop('disabled', !has).toggleClass('has-progress', has);
    if (!has) this.#disarm();
  }

  setHidden(on) { this.$el.toggleClass('is-hidden', on); }

  #click() {
    if (this.$el.hasClass('is-armed')) { this.#disarm(); this.#onReset(); return; }
    this.$el.addClass('is-armed');
    this.$label.text('Confirmar?');
    this.$el.attr('aria-label', 'Confirmar: apagar todos os cards lidos');
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#disarm(), 5000);
  }

  #disarm() {
    clearTimeout(this.#timer);
    this.$el.removeClass('is-armed').attr('aria-label', 'Reiniciar progresso de leitura');
    this.$label.text('Reiniciar');
  }
}
