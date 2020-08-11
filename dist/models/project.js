export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["activeProjects"] = 0] = "activeProjects";
    ProjectStatus[ProjectStatus["finishedProjects"] = 1] = "finishedProjects";
})(ProjectStatus || (ProjectStatus = {}));
export class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
//# sourceMappingURL=project.js.map