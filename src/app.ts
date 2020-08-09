interface Project {
	id: string;
	title: string;
	description: string;
	people: number;
}

class ProjectState {
	private projects: Project[] = [];

	public addProject(title: string, description: string, people: number) {
		const newProject = {
			id: Math.random().toString(),
			title,
			description,
			people,
		};

		this.projects.push(newProject);
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

class ProjectList {
	templateElement: HTMLTemplateElement;
	element: HTMLElement;
	hostElement: HTMLElement;

	constructor(public type: string) {
		this.templateElement = document.querySelector(
			'#project-list'
		) as HTMLTemplateElement;
		this.hostElement = document.getElementById('app') as HTMLElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);

		this.element = importedNode.firstElementChild as HTMLElement;
		this.element.id = `${this.type}-projects`;
		console.log(this.element);

		this.attach();
		this.renderContent();
	}

	private renderContent() {
		this.element.querySelector(
			'h2'
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}
}

class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	title: HTMLInputElement;
	description: HTMLInputElement;
	people: HTMLInputElement;

	constructor() {
		this.templateElement = document.getElementById(
			'project-input'
		) as HTMLTemplateElement;

		this.hostElement = document.getElementById('app') as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);

		this.element = importedNode.firstElementChild as HTMLFormElement;
		this.element.id = 'user-input';

		this.title = this.element.querySelector('#title') as HTMLInputElement;
		this.description = this.element.querySelector(
			'#description'
		) as HTMLInputElement;
		this.people = this.element.querySelector('#people') as HTMLInputElement;

		this.configure();
		this.attach();
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

	private configure() {
		this.element.addEventListener('submit', this.submitHandler.bind(this));
	}

	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}

const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');
