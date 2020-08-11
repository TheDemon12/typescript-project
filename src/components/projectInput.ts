import ProjectElement from '../models/projectElement.js';
import store from '../state/state.js';
import validate from '../utils/validate.js';

export class ProjectInput extends ProjectElement<
	HTMLDivElement,
	HTMLFormElement
> {
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
