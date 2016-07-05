// Action format:
// https://github.com/acdlite/flux-standard-action

import {reset as resetForm} from 'redux-form';

export const HYDRATE = 'cesium/HYDRATE'

export const FETCH_PROJECTS = 'cesium/FETCH_PROJECTS'
export const RECEIVE_PROJECTS = 'cesium/RECEIVE_PROJECTS'
export const ADD_PROJECT = 'cesium/ADD_PROJECT'
export const DELETE_PROJECT = 'cesium/DELETE_PROJECT'
export const SELECT_PROJECT = 'cesium/SELECT_PROJECT'
export const UPDATE_PROJECT = 'cesium/UPDATE_PROJECT'
export const HIDE_NEWPROJECT_FORM = 'cesium/HIDE_NEWPROJECT_FORM'

export const FETCH_DATASETS = 'cesium/FETCH_DATASETS'
export const RECEIVE_DATASETS = 'cesium/RECEIVE_DATASETS'

export const RECEIVE_FEATURESETS = 'cesium/RECEIVE_FEATURESETS'
export const CLEAR_FEATURES_FORM = 'cesium/CLEAR_FEATURES_FORM'

export const RECEIVE_MODELS = 'cesium/RECEIVE_MODELS'
export const CREATE_MODEL = 'cesium/CREATE_MODEL'

export const RECEIVE_PREDICTIONS = 'cesium/RECEIVE_PREDICTIONS'

export const SHOW_NOTIFICATION = 'cesium/SHOW_NOTIFICATION'
export const HIDE_NOTIFICATION = 'cesium/HIDE_NOTIFICATION'

export const TOGGLE_EXPANDER = 'cesium/TOGGLE_EXPANDER'
export const HIDE_EXPANDER = 'cesium/HIDE_EXPANDER'
export const SHOW_EXPANDER = 'cesium/SHOW_EXPANDER'


// Refactor this into a utility function
String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};


export function hydrate() {
  return dispatch => {
    dispatch(fetchProjects())
      .then(proj => {
        dispatch(fetchDatasets());
        dispatch(fetchFeaturesets());
      })
//  dispatch(fetchModels());
//  dispatch(fetchPredictions());
  }
}

function promiseAction(dispatch, action_type, promise) {
  dispatch({
    type: action_type,
    payload: {
      promise: promise
    }
  });
  return promise;
}


// Download projects
export function fetchProjects() {
  return dispatch =>
    promiseAction(
      dispatch,
      FETCH_PROJECTS,

      fetch('/project')
        .then(response => response.json())
        .then(json => {
          if (json.status == 'success') {
            dispatch(receiveProjects(json.data))
          } else {
            dispatch(
              showNotification(
                'Error downloading projects ({})'.format(json.message)
              ));
          }
          return json;
        }
        ).catch(ex => console.log('fetchProjects exception:', ex))
      )
}

// Add a new project
export function addProject(form) {
  return dispatch =>
    promiseAction(
      dispatch,
      ADD_PROJECT,

      fetch('/project',
            {method: 'POST',
             body: JSON.stringify(form),
             headers: new Headers({
               'Content-Type': 'application/json'
             })})
        .then(response => response.json())
        .then(json => {
          if (json.status == 'success') {
            dispatch(resetForm('newProject'));
            dispatch(showNotification('Successfully added new project'))
            dispatch(selectProject(json.data.id));
          } else {
            return Promise.reject({_error: json.message});
          }
          return json;
        })
  )
}


// Update an existing project
export function updateProject(form) {
  return dispatch =>
    promiseAction(
      dispatch,
      UPDATE_PROJECT,

      fetch('/project/{}'.format(form.projectId),
            {method: 'PUT',
             body: JSON.stringify(form),
             headers: new Headers({
               'Content-Type': 'application/json'
             })})
        .then(response => response.json())
        .then(json => {
          if (json.status == 'success') {
            dispatch(resetForm('newProject'));
            dispatch(showNotification('Successfully updated project'))
          } else {
            return Promise.reject({_error: json.message});
          }
          return json;
        })
  )
}


export function deleteProject(id) {
  return dispatch =>
    promiseAction(
      dispatch,
      DELETE_PROJECT,

      fetch('/project/' + id, {method: 'DELETE'})
        .then(response => response.json())
        .then(json => {
          if (json.status == 'success') {
            dispatch(showNotification('Project successfully deleted'));
          } else {
            dispatch(
              showNotification(
                'Error deleting project ({})'.format(json.message)
              ));
          }
        })
  )
}



// Receive list of projects
function receiveProjects(projects) {
  return {
    type: RECEIVE_PROJECTS,
    payload: projects
  }
}


// Download datasets
export function fetchDatasets() {
  return dispatch =>
    promiseAction(
      dispatch,
      FETCH_DATASETS,

      fetch('/dataset')
        .then(response => response.json())
        .then(json => {
          return dispatch(receiveDatasets(json.data))
        }
        ).catch(ex => console.log('fetchDatasets', ex))
    )
}

// Receive list of projects
function receiveDatasets(datasets) {
  return {
    type: RECEIVE_DATASETS,
    payload: datasets
  }
}


// Download featuresets
export function fetchFeaturesets() {
  return dispatch =>
    promiseAction(
      dispatch,
      FETCH_DATASETS,

      fetch('/features')
        .then(response => response.json())
        .then(json => {
          return dispatch(receiveFeaturesets(json.data))
        }
        ).catch(ex => console.log('fetchFeaturesets', ex))
  )
}

// Receive list of featuresets
function receiveFeaturesets(featuresets) {
  return {
    type: RECEIVE_FEATURESETS,
    payload: featuresets
  }
}


// POST new featureset form
export function submitNewFeatureset(formdata) {
  var data = new FormData();
  data.append("json", JSON.stringify(formdata));
  return dispatch => (
    fetch('/features',
          {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
          }
    ).then(response => response.json())
     .then(json => {
       console.log('Added new feature set');
       return json;
     }
     ).catch(ex => console.log('submitNewFeatureset', ex))
  )
}

// Clear features form after submit
function clearFeaturesForm() {
  return {
    type: CLEAR_FEATURES_FORM
  }
}


export function createModel(form) {
  return {
    type: CREATE_MODEL,
    payload: form
  }
}

export function showNotification(text) {
  return (dispatch) => {
    setTimeout(() => dispatch(hideNotification()), 3500);
    dispatch({
      type: SHOW_NOTIFICATION,
      payload: text
    });
  }
}

export function hideNotification() {
  return {
    type: HIDE_NOTIFICATION
  }
}

export function hideExpander(id) {
  return {
    type: HIDE_EXPANDER,
    payload: {
      id: id
    }
  }
}

export function showExpander(id) {
  return {
    type: SHOW_EXPANDER,
    payload: {
      id: id
    }
  }
}

export function toggleExpander(id) {
  return {
    type: TOGGLE_EXPANDER,
    payload: {
      id: id
    }
  }
}

// Currently, used upon creation of a new project to switch to that project
export function selectProject(id) {
  return dispatch => {
    dispatch(hideExpander('newProjectExpander'));

    return dispatch({
      type: SELECT_PROJECT,
      payload: {id}
    })
  }
}
