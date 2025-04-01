import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/homeView.vue'
import FlowChartView from '../views/flowChartView.vue'
import ClassDiagramView from '../views/classDiagramView.vue'
import SequenceDiagramView from '../views/sequenceDiagramView.vue'
import CustomDiagramView from '../views/customDiagramView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/flow-chart',
      name: 'flowChart',
      component: FlowChartView
    },
    {
      path: '/class-diagram',
      name: 'classDiagram',
      component: ClassDiagramView
    },
    {
      path: '/sequence-diagram',
      name: 'sequenceDiagram',
      component: SequenceDiagramView
    },
    {
      path: '/custom-diagram',
      name: 'customDiagram',
      component: CustomDiagramView
    }
  ]
})

export default router