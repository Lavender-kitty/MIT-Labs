export const Modal = {
    init(modalId, unitFormId) {
        this.modal = document.getElementById(modalId);
        this.form = document.getElementById(unitFormId);
    },

    show(visible) {
        if (visible) {
            this.modal.classList.remove('hidden');
        } else {
            this.modal.classList.add('hidden');
            this.form.reset();
        }
    }
};
