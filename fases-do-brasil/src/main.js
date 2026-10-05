import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/main.css';
import $ from 'jquery';
import { AppController } from '@/controller/AppController.js';

$(() => new AppController().start());
