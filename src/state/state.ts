import { Project, ProjectStatus } from '../models/project.js';

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

export default store;
