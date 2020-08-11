enum ProjectStatus {
	activeProjects,
	finishedProjects,
}

interface Draggable {
	dragStartHandler(e: DragEvent): void;
	dragEndHandler(e: DragEvent): void;
}

interface DragTarget {
	dragOverHandler(e: DragEvent): void;
	dropHandler(e: DragEvent): void;
	dragLeaveHandler(e: DragEvent): void;
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
	private projects: Project[] = [];
	private listeners: Listener[] = [];

	private callListeners() {
		this.listeners.forEach(listener => listener(this.projects.slice()));
	}

	public addListeners(listener: Listener) {
		this.listeners.push(listener);
	}

	public addProject(title: string, description: string, people: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			people,
			ProjectStatus.activeProjects
		);
		this.projects.push(newProject);
		this.callListeners();
	}

	public moveProject(projectId: string, projectStatus: ProjectStatus) {
		const project = this.projects.find(project => project.id === projectId);
		if (project) {
			if (project.status !== projectStatus) {
				project.status = projectStatus;
				this.callListeners();
			}
		}
	}
}
const store = new ProjectState();

interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(config: Validatable): boolean {
	let isValid = true;

	if (config.required && config.value.toString().trim().length === 0)
		isValid = false;
	if (
		config.minLength &&
		config.value.toString().trim().length < config.minLength
	)
		isValid = false;
	if (
		config.maxLength &&
		config.value.toString().trim().length > config.maxLength
	)
		isValid = false;
	if (
		config.max &&
		typeof config.value === 'number' &&
		config.value > config.max
	)
		isValid = false;
	if (
		config.min &&
		typeof config.value === 'number' &&
		config.value < config.min
	)
		isValid = false;

	return isValid;
}

abstract class ProjectElement<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(
			templateId
		) as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId) as T;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);

		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}

		this.attach(insertAtStart);
	}

	private attach(insertAtStart: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtStart ? 'afterbegin' : 'beforeend',
			this.element
		);
	}
}

class ProjectItem extends ProjectElement<HTMLUListElement, HTMLLIElement>
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

class ProjectList extends ProjectElement<HTMLDivElement, HTMLElement>
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

class ProjectInput extends ProjectElement<HTMLDivElement, HTMLFormElement> {
	title: HTMLInputElement;
	description: HTMLInputElement;
	people: HTMLInputElement;

	constructor() {
		super('project-input', 'app', true, 'user-input');

		this.title = this.element.querySelector('#title') as HTMLInputElement;
		this.description = this.element.querySelector(
			'#description'
		) as HTMLInputElement;
		this.people = this.element.querySelector('#people') as HTMLInputElement;

		this.configure();
	}

	configure() {
		this.element.addEventListener('submit', this.submitHandler.bind(this));
	}

	private gatherUserInput(): undefined | [string, string, number] {
		const titleValue = this.title.value;
		const descriptionValue = this.description.value;
		const peopleValue = this.people.value;

		const titleValidatable = {
			value: titleValue,
			minLength: 5,
			maxLength: 255,
		};
		const descriptionValidatable = {
			value: descriptionValue,
			minLength: 5,
			maxLength: 255,
		};
		const peopleValidatable = {
			value: peopleValue,
			min: 1,
			max: 10,
		};

		if (
			!validate(titleValidatable) ||
			!validate(descriptionValidatable) ||
			!validate(peopleValidatable)
		) {
			alert('Invalid Properties Specified');
			return;
		} else {
			return [titleValue, descriptionValue, +peopleValue];
		}
	}

	private clearInput() {
		this.title.value = '';
		this.description.value = '';
		this.people.value = '';
	}

	private submitHandler(e: Event) {
		e.preventDefault();

		const res = this.gatherUserInput();
		if (res) {
			const [title, description, people] = res;
			store.addProject(title, description, people);
			this.clearInput();
		}
	}
}

const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');
