import ProjectElement from '../models/projectElement.js';
import store from '../state/state.js';
import validate from '../utils/validate.js';
export class ProjectInput extends ProjectElement {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.title = this.element.querySelector('#title');
        this.description = this.element.querySelector('#description');
        this.people = this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }
    gatherUserInput() {
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
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid Properties Specified');
            return;
        }
        else {
            return [titleValue, descriptionValue, +peopleValue];
        }
    }
    clearInput() {
        this.title.value = '';
        this.description.value = '';
        this.people.value = '';
    }
    submitHandler(e) {
        e.preventDefault();
        const res = this.gatherUserInput();
        if (res) {
            const [title, description, people] = res;
            store.addProject(title, description, people);
            this.clearInput();
        }
    }
}
//# sourceMappingURL=projectInput.js.map