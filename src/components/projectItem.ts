import { Draggable } from '../models/drag-drop.js';
import ProjectElement from '../models/projectElement.js';
import { Project } from '../models/project.js';

export class ProjectItem extends ProjectElement<HTMLUListElement, HTMLLIElement>
	implements Draggable {
	private project: Project;

	get persons() {
		return `${this.project.people} person${
			this.project.people > 1 ? 's' : ''
		} assigned`;
	}

	constructor(hostId: string, pr: Project) {
		super('single-project', hostId, false, pr.id);
		this.project = pr;

		this.renderContent();

		this.element.addEventListener(
			'dragstart',
			this.dragStartHandler.bind(this)
		);
		this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
	}

	dragStartHandler(event: DragEvent) {
		event.dataTransfer!.setData('text/plain', this.project.id);
		event.dataTransfer!.effectAllowed = 'move';
	}

	dragEndHandler(_event: DragEvent) {
		// console.log('dragEnd');
	}

	private renderContent() {
		(this.element.querySelector(
			'h2'
		) as HTMLHeadingElement).textContent = this.project.title;

		(this.element.querySelector(
			'h3'
		) as HTMLHeadingElement).textContent = this.persons;

		(this.element.querySelector(
			'p'
		) as HTMLParagraphElement).textContent = this.project.description;
	}
}
