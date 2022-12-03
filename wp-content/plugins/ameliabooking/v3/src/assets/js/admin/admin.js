import { createApp, defineAsyncComponent } from 'vue/dist/vue.esm-bundler'
import store from '../../../store'
import {provide, ref, reactive, readonly} from "vue";

const CustomizeWrapper = defineAsyncComponent({
  loader: () => import('../../../views/admin/customize/Customize.vue')
})

const dynamicCdn = window.wpAmeliaUrls.wpAmeliaPluginURL + 'v3/public/';

window.__dynamic_handler__ = function(importer) {
  return dynamicCdn + 'assets/' + importer;
}
// @ts-ignore
window.__dynamic_preload__ = function(preloads) {
  return preloads.map(preload => dynamicCdn + preload);
}

createApp({
  setup() {
    const baseURLs = ref(window.wpAmeliaUrls)
    const languages = reactive(window.wpAmeliaLanguages)
    const settings = reactive(window.wpAmeliaSettings)
    const labels = reactive(window.wpAmeliaLabels)
    provide('settings', readonly(settings))
    provide('baseUrls', readonly(baseURLs))
    provide('languages', readonly(languages))
    provide('labels', readonly(labels))
  }
}).component('Customize', CustomizeWrapper).use(store).mount('#amelia-app-backend-new')
