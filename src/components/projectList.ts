import { DragTarget } from '../models/drag-drop.js';
import ProjectElement from '../models/projectElement.js';
import { Project, ProjectStatus } from '../models/project.js';
import { ProjectItem } from '../components/projectItem.js';
import store from '../state/state.js';

export class ProjectList extends ProjectElement<HTMLDivElement, HTMLElement>
	implements DragTarget {
	assignedProjects: Project[] = [];

	constructor(public type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);

		this.renderContent();
		this.configure();
	}

	configure() {
		store.addListeners((projects: Project[]) => {
			const relevantProjects = projects.filter(project => {
				if (this.type === 'active')
					return project.status === ProjectStatus.activeProjects;
				return project.status === ProjectStatus.finishedProjects;
			});

			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});

		this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
		this.element.addEventListener(
			'dragleave',
			this.dragLeaveHandler.bind(this)
		);
		this.element.addEventListener('drop', this.dropHandler.bind(this));
	}

	dragOverHandler(event: DragEvent) {
		event.preventDefault();
		this.element.querySelector('ul')!.classList.add('droppable');
	}

	dragLeaveHandler() {
		this.element.querySelector('ul')!.classList.remove('droppable');
	}

	dropHandler(event: DragEvent) {
		const id = event.dataTransfer?.getData('text/plain')!;
		console.log(this.type);
		store.moveProject(
			id,
			this.type === 'active'
				? ProjectStatus.activeProjects
				: ProjectStatus.finishedProjects
		);
		this.element.querySelector('ul')!.classList.remove('droppable');
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		) as HTMLUListElement;
		listEl.innerHTML = '';
		this.assignedProjects.forEach(project => {
			new ProjectItem(`${this.type}-projects-list`, project);
		});
	}

	private renderContent() {
		this.element.querySelector(
			'h2'
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;

		const ulElement = this.element.querySelector('ul') as HTMLUListElement;
		ulElement.id = `${this.type}-projects-list`;

		this.assignedProjects.forEach(project => {
			new ProjectItem(`${this.type}-projects-list`, project);
		});
	}
}
