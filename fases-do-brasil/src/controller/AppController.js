import $ from 'jquery';
import { SITE } from '@/infra/data/phases.data.js';
import { Router } from '@/infra/Router.js';
import { ApiPhaseRepository } from '@/infra/repositories/ApiPhaseRepository.js';
import { LocalPhaseRepository } from '@/infra/repositories/LocalPhaseRepository.js';
import { PhaseService } from '@/services/PhaseService.js';
import { ProgressService } from '@/services/ProgressService.js';
import { TimelineModel } from '@/models/TimelineModel.js';
import { NavbarView } from '@/view/NavbarView.js';
import { TimelineView } from '@/view/TimelineView.js';
import { DetailView } from '@/view/DetailView.js';
import { AboutView } from '@/view/AboutView.js';
import { TeamView } from '@/view/TeamView.js';
import { PageManager } from '@/view/PageManager.js';
import { SceneView } from '@/view/SceneView.js';
import { BubblesView } from '@/view/BubblesView.js';
import { NavController } from '@/controller/NavController.js';
import { TimelineController } from '@/controller/TimelineController.js';
import { DetailController } from '@/controller/DetailController.js';
import { SceneController } from '@/controller/SceneController.js';
import { BackgroundController } from '@/controller/BackgroundController.js';

/** Composition Root: monta dependências (injeção manual), registra rotas e inicia a aplicação. */
export class AppController {
  async start() {
    const service = new PhaseService(new ApiPhaseRepository(), new LocalPhaseRepository());
    const progress = new ProgressService();
    const model = new TimelineModel(progress);
    const router = new Router();
    const pages = new PageManager();

    const timelineView = new TimelineView('#page-home');
    const detailView = new DetailView('#detail');
    const aboutView = new AboutView('#page-sobre .container');
    const teamView = new TeamView('#page-equipe .container');

    const nav = new NavController(new NavbarView('#navbar'));
    const timeline = new TimelineController(model, timelineView);
    const detail = new DetailController({ model, detailView, timelineView, router });
    const scene = new SceneController(new SceneView(document.getElementById('scene')));
    const background = new BackgroundController({ sceneView: scene.scene, bubblesView: new BubblesView('#bubbles') });

    nav.init();
    scene.init();
    timeline.init();
    detail.init();
    background.init();

    // ---- Rotas: / · /fase/:id · /sobre · /equipe
    const closeDetail = () => model.opened && model.close();
    router
      .add('/', () => { pages.show('home', { resetScroll: !model.opened }); closeDetail(); })
      .add('/fase/:id', ({ params }) => {
        pages.show('home', { resetScroll: false });
        if (!detail.openById(params.id)) router.navigate('/', { replace: true });
      })
      .add('/sobre', () => { closeDetail(); pages.show('sobre'); })
      .add('/equipe', () => { closeDetail(); pages.show('equipe'); })
      .fallback(() => router.navigate('/', { replace: true }));

    try {
      const { phases, periods, source } = await service.load();
      document.documentElement.dataset.source = source;
      aboutView.render({ periods, site: SITE });
      teamView.render({ site: SITE });
      model.hydrate({ phases, periods });
    } catch (err) {
      console.error(err);
      $('#page-home .journey__text').text('Não foi possível carregar as fases.');
    } finally {
      router.start();
      $('#loader').addClass('is-done');
      setTimeout(() => $('#loader').remove(), 700);
    }
  }
}
