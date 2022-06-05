let CONTAINER = null;

export class Tooltip {
    static ALL = [];

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

    constructor(args) {
        const reference = args.reference;
        const element = document.createElement("div");

        element.className = "tooltip";
        $(element).html(args.text);

        CONTAINER.appendChild(element);

        Tooltip.ALL.push(this);

        this.text = args.text;
        this.element = element;
        this.reference = reference;
        this.is_opened = false;

        if (
            typeof args.enableEvents == "undefined" ||
            args.enableEvents === true
        ) {
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

        const reference = this.reference;
        const element = this.element;

        const position = $(reference).offset();

        const left = position.left;
        const top = position.top - $(element).outerHeight() - 5;

        $(element).css("top", top + "px");
        $(element).css("left", left + "px");

        $(element).addClass("tooltip-show");
    }

    hide() {
        this.is_opened = false;

        $(this.element).removeClass("tooltip-show");
    }

    isOpened() {
        return this.is_opened;
    }

    updateText(text) {
        this.text = text;

        $(this.element).html(text);
    }
}
