import cito from 'citojs';
import Task from './task';
import template from './template';

const PATH_TO_FILTER = {
	'/': 'all',
	'/active': 'active',
	'/completed': 'completed'
};

class App {
	constructor(el, storage, router) {
		this.el = el;
		this.storage = storage;
		this.router = router;
		this.todos = Task.map(storage.get() || []);

		this.router.on('change', path => {
			this.filter = PATH_TO_FILTER[path] || PATH_TO_FILTER['/'];
			this.render();
		});
	}

	getActiveTodos() {
		return this.todos.filter(todo => !todo.completed);
	}

	getFilteredTodos() {
		if (this.filter === 'all') {
			return this.todos;
		}

		return this.todos.filter(todo => (
			('active' === this.filter && !todo.completed) ||
			('completed' === this.filter && todo.completed)
		))
	}

	handleEvent(evt, type, data) {
		evt.preventDefault();

		switch (type) {
			case 'add':
				this.todos.push(new Task(data.value));
				data.value = '';
				break;

			case 'toggle':
				data.completed = !data.completed;
				break;

			case 'markall':
				this.getFilteredTodos().forEach(todo => {
					todo.completed = data;
				});
				break;

			case 'remove':
				this.todos.splice(this.todos.indexOf(data), 1);
				break;

			case 'clear':
				this.todos = this.todos.filter(todo => !todo.completed);
				break;
		}

		this.render();
		this.storage.set(this.todos);
	}

	render() {
		const activeTodos = this.getActiveTodos();
		const filteredTodos = this.getFilteredTodos();
		const fragment = template.call(this, {
			todos: this.todos,
			filter: this.filter,
			allCompleted: filteredTodos.length && filteredTodos.every(todo => todo.completed),
			activeTodos,
			filteredTodos
		});

		if (this.virtualNode) {
			cito.vdom.update(this.virtualNode, fragment);
		} else {
			this.virtualNode = cito.vdom.append(this.el, fragment);
		}

		return this;
	}
}

export function boot(el, storage, router) {
	return new App(el, storage, router).render();
}
