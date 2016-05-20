var React = require("react");
var ReactDOM = require("react-dom");
var ReactCSSTransitionGroup = require("react-addons-css-transition-group");
var $ = require("jquery");
global.jQuery = $;
require("bootstrap-css");
require("bootstrap");

var MainContent = React.createClass({
    getInitialState: function() {
        return {
            forms: {
                newProject: {
                    "Project Name": "",
                    "Description/notes": "",
                    "Additional Authorized Users": ""
                },
                newDataset: {
                    "Select Project": "",
                    "Dataset Name": "",
                    "Header File": "",
                    "Tarball Containing Data": ""
                }
            },
            projectsList: [{"name": "", "created": "", "id": ""}],
            datasetsList: []
        };
    },
    componentDidMount: function() {
        this.loadState();
    },
    loadState: function() {
        $.ajax({
            url: "/get_state",
            dataType: "json",
            cache: false,
            success: function(data) {
                this.setState({projectsList: data.projectsList,
                               datasetsList: data.datasetsList,
                               modelsList: data.modelsList,
                               featuresetList: data.featuresetList,
                               predictionsList: data.predictionsList
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/get_state", status, err.toString(),
                              xhr.repsonseText);
            }.bind(this)
        });
    },
    handleNewProjectSubmit: function(e) {
        e.preventDefault();
        $.ajax({
            url: "/newProject",
            dataType: "json",
            type: "POST",
            data: this.state.forms.newProject,
            success: function(data) {
                var form_state = this.state.forms;
                form_state.newProject = this.getInitialState().forms.newProject;
                this.setState({projectsList: data, forms: form_state});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/newProject", status, err.toString(),
                              xhr.repsonseText);
            }.bind(this)
        });
    },
    handleEditProject: function(projectID, e) {
        // TODO: Open form in Dialog
        console.log("handleEditProject was called, but nothing here yet...");
    },
    handleDeleteProject: function(projectID, e) {
        $.ajax({
            url: "/deleteProject",
            dataType: "json",
            type: "POST",
            data: {"project_key": projectID},
            success: function(data) {
                this.setState({projectsList: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("/deleteProject", status, err.toString(),
                              xhr.repsonseText);
            }.bind(this)
        });
    },
    handleNewDatasetSubmit: function(e){
        {/* e.preventDefault();
            // var formData = new FormData($("#datasetForm"));
            $.ajax({
            url: "/uploadData",
            dataType: "json",
            type: "POST",
            contentType: false,
            // data: formData,
            data: this.state.forms.newDataset,
            success: function(data) {
            var form_state = this.state.forms;
            form_state.newDataset = this.getInitialState().forms.newDataset;
            this.setState({datasetsList: data.datasetsList, forms: form_state});
            }.bind(this),
            error: function(xhr, status, err) {
            console.error("/uploadData", status, err.toString(),
            xhr.repsonseText);
            }.bind(this)
            }); */}

        $("#datasetForm").ajaxSubmit({
            success: function(response) {
                console.log(response);
            },
            error: function(response) {
                console.log("error");
                console.log(response);
            }
        });
    },
    handleInputChange: function(inputName, inputTypeTag, formName, e) {
        var form_state = this.state.forms;
        form_state[formName][inputName] = e.target.value;
        this.setState({forms: form_state});
    },
    render: function() {
        return (
            <div className="mainContent">
                <ProjectsTabContent
                    getInitialState={this.getInitialState}
                    loadState={this.loadState}
                    handleNewProjectSubmit={this.handleNewProjectSubmit}
                    handleEditProject={this.handleEditProject}
                    handleDeleteProject={this.handleDeleteProject}
                    handleInputChange={this.handleInputChange}
                    formFields={this.state.forms.newProject}
                    projectsList={this.state.projectsList}
                />
                <DatasetsTabContent
                    getInitialState={this.getInitialState}
                    loadState={this.loadState}
                    handleNewDatasetSubmit={this.handleNewDatasetSubmit}
                    handleInputChange={this.handleInputChange}
                    formFields={this.state.forms.newDataset}
                    projectsList={this.state.projectsList}
                    datasetsList={this.state.datasetsList}
                />
                <FeaturesTabContent
                    getInitialState={this.getInitialState}
                    loadState={this.loadState}
                    handleNewDatasetSubmit={this.handleNewDatasetSubmit}
                    handleInputChange={this.handleInputChange}
                    formFields={this.state.forms.newDataset}
                    projectsList={this.state.projectsList}
                    datasetsList={this.state.datasetsList}
                />
            </div>
        );
    }
});

var ProjectsTabContent = React.createClass({
    render: function() {
        return (
            <div className="projectsTabContent">
                <NewProjectForm
                    handleInputChange={this.props.handleInputChange}
                    formFields={this.props.formFields}
                    handleSubmit={this.props.handleNewProjectSubmit}
                />
                <ProjectList
                    projectsList={this.props.projectsList}
                    editProject={this.props.handleEditProject}
                    deleteProject={this.props.handleDeleteProject}
                />
            </div>
        );
    }
});

var NewProjectForm = React.createClass({
    render: function() {
        return (
            <div className="formTableDiv">
                <FormTitleRow formTitle="Create a new project"
                />
                <FormInputRow inputName="Project Name"
                              inputTag="input"
                              inputType="text"
                              formName="newProject"
                              value={this.props.formFields["Project Name"]}
                              handleInputChange={this.props.handleInputChange}
                />
                <FormInputRow inputName="Description/notes"
                              inputTag="textarea"
                              formName="newProject"
                              value={this.props.formFields["Description/notes"]}
                              handleInputChange={this.props.handleInputChange}
                />
                <FormInputRow inputName="Additional Authorized Users"
                              inputTag="textarea"
                              formName="newProject"
                              value={this.props.formFields["Additional Authorized Users"]}
                              handleInputChange={this.props.handleInputChange}
                />
                <div className="submitButtonDiv" style={{marginTop: 15}}>
                    <input type="submit"
                           onClick={this.props.handleSubmit}
                           value="Submit"
                           className="submitButton"
                    />
                </div>
            </div>
        );
    }
});

var ProjectList = React.createClass({
    render: function() {
        var projectNodes = this.props.projectsList.map(function(project) {
            return (
                <ProjectListRow
                    project={project}
                    key={project.id}
                    editProject={this.props.editProject}
                    deleteProject={this.props.deleteProject}
                />
            );
        }.bind(this));
        return (
            <div className="projectListDiv" style={{marginTop: 40}}>
                <h3>Existing Projects</h3>
                <div style={{width: 320, float: 'left'}}>
                    <b>Name</b>
                </div>
                <div style={{marginLeft: 20, width: 320, float: 'left'}}>
                    <b>Date Created</b>
                </div>
                <div style={{marginLeft: 710}}>
                    <b>Edit/Delete Project</b>
                </div>
                <div>
                    <ReactCSSTransitionGroup
                        transitionName="projectsListItems"
                        transitionEnterTimeout={200}
                        transitionLeaveTimeout={200}>
                        {projectNodes}
                    </ReactCSSTransitionGroup>
                </div>
            </div>
        );
    }
});

var ProjectListRow = React.createClass({
    render: function() {
        return (
            <div>
                <div style={{width: 320, float: 'left'}}>
                    {this.props.project.name}
                </div>
                <div style={{marginLeft: 20, width: 320, float: 'left'}}>
                    {this.props.project.created}
                </div>
                <div style={{marginLeft: 710}}>
                    <a href="#" onClick={this.props.editProject.bind(null, this.props.project.id)}>
                        {/* Glyphicons don't work with npm bootstrap!
                        <span className="glyphicon glyphicon-edit"
                              title="Edit">
                        </span>
                        */}
                        [Edit]
                    </a>
                    <a href="#" onClick={this.props.deleteProject.bind(null, this.props.project.id)}>
                        {/* Glyphicons don't work with npm bootstrap!
                        <span style={{marginLeft: 10}}
                              className="glyphicon glyphicon-trash"
                              title="Delete">
                        </span>
                        */}
                        { " " }[Delete]
                    </a>
                </div>
            </div>
        );
    }
});

var EditProjectForm = React.createClass({
    getInitialState: function() {
        return {modalIsOpen: false};
    },
    openModal: function() {
        this.setState({modalIsOpen: true});
    },
    afterOpenModal: function() {
        // TODO
    },
    closeModal: function() {
        this.setState({modalIsOpen: false});
    },
    render: function() {
        // TODO: Populate with project details
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}>

                <FormTitleRow formTitle="Edit Project" />
            </Modal>
        );
    }
});

var FormInputRow = React.createClass({
    render: function() {
        return (
            <div className="formInputRow">
                <div className="formInputTitle"
                     style={{width: 320, float: 'left', marginTop: 5}}>
                    {this.props.inputName}
                </div>
                <div className="formInputField"
                     style={{marginLeft: 340, marginTop: 5}}>
                    <this.props.inputTag
                                 type={this.props.inputType}
                                 value={this.props.value}
                                 onChange={this.props.handleInputChange.bind(
                                         null, this.props.inputName,
                                         this.props.inputTypeTag,
                                         this.props.formName)}
                    />
                </div>
            </div>
        );
    }
});

var FormSelectInput = React.createClass({
    render: function() {
        var selectOptions = this.props.projectsList.map(function(project) {
            return (
                <option value={project.id} key={project.id}>
                    {project.name}
                </option>
            );
        }.bind(this));
        return (
            <div className="formInputRow">
                <div className="formInputTitle"
                     style={{width: 320, float: 'left', marginTop: 5}}>
                    {this.props.inputName}
                </div>
                <div className="formInputField"
                     style={{marginLeft: 340, marginTop: 5}}>
                    <select
                        value={this.props.value}
                        onChange={this.props.handleInputChange.bind(
                                null, this.props.inputName,
                                this.props.inputTypeTag,
                                this.props.formName)}>
                        {selectOptions}
                    </select>
                </div>
            </div>
        );
    }
});

var FormTitleRow = React.createClass({
    render: function() {
        return (
            <div className="formTitleDiv" style={{marginTop: 30}}>
                <h3>
                    {this.props.formTitle}
                </h3>
            </div>
        );
    }
});

var DatasetsTabContent = React.createClass({
    render: function() {
        return (
            <div className="datasetsTabContent">
                <DatasetsForm
                    handleInputChange={this.props.handleInputChange}
                    formFields={this.props.formFields}
                    handleSubmit={this.props.handleNewDatasetSubmit}
                    datasetsList={this.props.datasetsList}
                    projectsList={this.props.projectsList}
                    formName={this.props.formName}
                />
            </div>
        );
    }
});

var DatasetsForm = React.createClass({
    render: function() {
        return (
            <div className="formTableDiv">
                <form id="datasetForm" name="datasetForm"
                      action="/uploadData" enctype="multipart/form-data"
                      method="post">
                    <FormTitleRow formTitle="Upload new time series data"/>
                    <FormSelectInput inputName="Select Project"
                                     inputTag="select"
                                     formName="newDataset"
                                     projectsList={this.props.projectsList}
                                     value={this.props.formFields["Select Project"]}
                                     handleInputChange={this.props.handleInputChange}
                    />
                    <FormInputRow inputName="Dataset Name"
                                  inputTag="input"
                                  inputType="text"
                                  formName="newDataset"
                                  value={this.props.formFields["Dataset Name"]}
                                  handleInputChange={this.props.handleInputChange}
                    />
                    <FormInputRow inputName="Header File"
                                  inputTag="input"
                                  inputType="file"
                                  formName="newDataset"
                                  value={this.props.formFields["Header File"]}
                                  handleInputChange={this.props.handleInputChange}
                    />
                    <FormInputRow inputName="Tarball Containing Data"
                                  inputTag="input"
                                  inputType="file"
                                  formName="newDataset"
                                  value={this.props.formFields["Tarball Containing Data"]}
                                  handleInputChange={this.props.handleInputChange}
                    />

                    <div className="submitButtonDiv" style={{marginTop: 15}}>
                        <input type="submit"
                               onClick={this.props.handleSubmit}
                               value="Submit"
                               className="submitButton"
                        />
                    </div>
                </form>
            </div>
        );
    }
});

var FeaturesTabContent = React.createClass({
    render: function() {
        return (
            <div className="featuresTabContent">
                <FeaturizeForm
                    handleInputChange={this.props.handleInputChange}
                    formFields={this.props.formFields}
                    handleSubmit={this.props.handleNewDatasetSubmit}
                    datasetsList={this.props.datasetsList}
                    featuresetsList={this.props.featuresetsList}
                    projectsList={this.props.projectsList}
                    formName={this.props.formName}
                />
            </div>
        );
    }
});

var FeaturizeForm = React.createClass({
    render: function() {
        return (
            <div className="formTableDiv">
                <form id="featurizeForm" name="featurizeForm"
                      action="/FeaturizeData" enctype="multipart/form-data"
                      method="post">
                    <FormTitleRow formTitle="Featurize Data"/>
                    <FormSelectInput inputName="Select Project"
                                     inputTag="select"
                                     formName="featurize"
                                     projectsList={this.props.projectsList}
                                     value={this.props.formFields["Select Project"]}
                                     handleInputChange={this.props.handleInputChange}
                    />
                    <FormSelectInput inputName="Select Dataset"
                                     inputTag="select"
                                     formName="featurize"
                                     projectsList={this.props.projectsList}
                                     value={this.props.formFields["Select Dataset"]}
                                     handleInputChange={this.props.handleInputChange}
                    />
                    <FormInputRow inputName="Feature Set Title"
                                  inputTag="input"
                                  inputType="text"
                                  formName="featurize"
                                  value={this.props.formFields["Dataset Name"]}
                                  handleInputChange={this.props.handleInputChange}
                    />


                    // TODO: FEATURE SELECTION DIALOG!!


                    <div className="submitButtonDiv" style={{marginTop: 15}}>
                        <input type="submit"
                               onClick={this.props.handleSubmit}
                               value="Submit"
                               className="submitButton"
                        />
                    </div>
                </form>
            </div>
        );
    }
});

ReactDOM.render(
    <MainContent />,
    document.getElementById('content')
);

