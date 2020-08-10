enum ProjectStatus {
	activeProjects,
	finishedProjects,
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
			Math.random.toString(),
			title,
			description,
			people,
			ProjectStatus.activeProjects
		);
		this.projects.push(newProject);
		this.callListeners();
	}

	public getProjects() {
		return this.projects;
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

	abstract configure(): void;
}

class ProjectList extends ProjectElement<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[] = [];

	constructor(public type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);

		this.configure();
		this.renderContent();
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
	}

	private renderProjects() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		) as HTMLUListElement;
		listEl.innerHTML = '';
		this.assignedProjects.forEach(project => {
			const liEl = document.createElement('li');
			liEl.textContent = project.description;
			listEl.appendChild(liEl);
		});
	}

	private renderContent() {
		this.element.querySelector(
			'h2'
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;

		const ulElement = this.element.querySelector('ul') as HTMLUListElement;
		ulElement.id = `${this.type}-projects-list`;

		const liTemplateElement = document.getElementById(
			'single-project'
		) as HTMLTemplateElement;

		this.assignedProjects.forEach(project => {
			const importedNode = document.importNode(liTemplateElement.content, true);
			const liElement = importedNode.firstElementChild as HTMLLIElement;
			liElement.textContent = project.description;
			ulElement.insertAdjacentElement('afterbegin', liElement);
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
			console.log('Invalid Properties Specified');
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
