let CONTAINER: HTMLElement;

interface TooltipArgs {
    text: string;
    reference: HTMLElement;
    show?: "always" | "hover"; // default is 'hover'
}

export class Tooltip {
    static ALL: Tooltip[] = [];

    static init() {
        const container = document.createElement("div");

        container.id = "TooltipContainer";
        document.body.appendChild(container);

        CONTAINER = container;
    }

    static removeAll() {
        for (let a = Tooltip.ALL.length - 1; a >= 0; a--) {
            const tooltip = Tooltip.ALL[a];

            tooltip.reference.onmouseover = null;
            tooltip.reference.onmouseout = null;

            CONTAINER.removeChild(tooltip.element);

            Tooltip.ALL.splice(a, 1);
        }
    }

    static hideAll() {
        for (let a = 0; a < Tooltip.ALL.length; a++) {
            Tooltip.ALL[a].hide();
        }
    }

    private text: string;
    private element: HTMLElement;
    private reference: HTMLElement;
    private is_opened: boolean;

    constructor(args: TooltipArgs) {
        const reference = args.reference;
        const element = document.createElement("div");

        element.className = "tooltip";
        $(element).html(args.text);

        reference.style.position = "relative";
        reference.appendChild(element);

        Tooltip.ALL.push(this);

        this.text = args.text;
        this.element = element;
        this.reference = reference;
        this.is_opened = false;

        if (typeof args.show == "undefined" || args.show === "hover") {
            reference.onmouseover = () => {
                this.show();
            };
            reference.onmouseout = () => {
                this.hide();
            };
        }
    }

    show() {
        if (this.text === "") {
            return;
        }

        this.is_opened = true;
        this.element.classList.remove("hidden");
    }

    hide() {
        this.is_opened = false;
        this.element.classList.add("hidden");
    }

    isOpened() {
        return this.is_opened;
    }

    updateText(text: string) {
        this.text = text;

        $(this.element).html(text);
    }
}
