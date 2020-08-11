interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

export default function validate(config: Validatable): boolean {
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
