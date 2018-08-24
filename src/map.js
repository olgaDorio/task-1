import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';

const preset = {
  active: 'islands#greenClusterIcons',
  defective: 'islands#redClusterIcons',
};

export function initMap(ymaps, containerId) {
  const myMap = new ymaps.Map(containerId, {
    center: [55.76, 37.64],
    controls: [],
    zoom: 10
  });

  const objectManager = new ymaps.ObjectManager({
    clusterize: true,
    clusterHasBalloon: false,
    gridSize: 64,
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout(ymaps),
  });

  objectManager.clusters.options.set('preset', preset.active);

  loadList().then(data => {
    objectManager.add(data);
    myMap.geoObjects.add(objectManager);
  });

  const objectClicked = (event) => {
    const objectId = event.get('objectId');
    const obj = objectManager.objects.getById(objectId);

    objectManager.objects.balloon.open(objectId);

    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        obj.properties.details = data;
        objectManager.objects.balloon.setData(obj);
      });
    }
  };

  const clusterAdded = ({ originalEvent }) => {
    const { id } = originalEvent.child;
    const { geoObjects } = originalEvent.child.properties;
    const isDefective = geoObjects.some(object => !object.isActive);
    objectManager.clusters.setClusterOptions(id, {
      preset: isDefective ? preset.defective : preset.active,
    });
  };

  const filtersAdded = (filters) => {
    objectManager.setFilter(
      obj => filters[obj.isActive ? 'active' : 'defective']
    );
  };

  const listBoxControl = createFilterControl(ymaps);
  const filterMonitor = new ymaps.Monitor(listBoxControl.state);

  myMap.controls.add(listBoxControl);
  filterMonitor.add('filters', filtersAdded);
  objectManager.clusters.events.add('add', clusterAdded);
  objectManager.objects.events.add('click', objectClicked);
}
