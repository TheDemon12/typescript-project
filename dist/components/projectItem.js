import ProjectElement from '../models/projectElement.js';
export class ProjectItem extends ProjectElement {
    constructor(hostId, pr) {
        super('single-project', hostId, false, pr.id);
        this.project = pr;
        this.renderContent();
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
    }
    get persons() {
        return `${this.project.people} person${this.project.people > 1 ? 's' : ''} assigned`;
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(_event) {
        // console.log('dragEnd');
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.persons;
        this.element.querySelector('p').textContent = this.project.description;
    }
}
//# sourceMappingURL=projectItem.js.map