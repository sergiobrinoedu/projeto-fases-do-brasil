import $ from 'jquery';
import { SITE } from '@/infra/data/phases.data.js';
import { bus } from '@/infra/EventBus.js';
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
import { LoginView } from '@/view/LoginView.js';
import { AuthService } from '@/auth/AuthService.js';
import { AuthController } from '@/controller/AuthController.js';
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
    const auth = new AuthService();
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

    const authCtl = new AuthController({ auth, view: new LoginView('#page-login .container'), router, pages, progress });

    // Restaura a sessão (cookie) antes de desenhar a navbar; falha de rede = visitante.
    const { user } = await auth.init();
    nav.init(user);
    authCtl.init();
    scene.init();
    timeline.init();
    detail.init();
    background.init();

    // ---- Rotas: / · /fase/:id · /sobre · /equipe · /login
    const closeDetail = () => model.opened && model.close();
    router
      .add('/', () => { pages.show('home', { resetScroll: !model.opened }); closeDetail(); })
      .add('/fase/:id', ({ params }) => {
        pages.show('home', { resetScroll: false });
        if (!detail.openById(params.id)) router.navigate('/', { replace: true });
      })
      .add('/sobre', () => { closeDetail(); pages.show('sobre'); })
      .add('/login', () => { closeDetail(); authCtl.show(); })
      .add('/equipe', () => { closeDetail(); pages.show('equipe'); })
      .fallback(() => router.navigate('/', { replace: true }));

    try {
      const { phases, periods, source } = await service.load();
      document.documentElement.dataset.source = source;
      aboutView.render({ periods, site: SITE });
      teamView.render({ site: SITE });
      model.hydrate({ phases, periods });
      progress.sync(); // se já estiver logado, une o progresso do banco com o do navegador
      bus.on('auth:changed', ({ user: u }) => u && progress.sync());
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
