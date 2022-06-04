var CONTAINER = null;

export class Tooltip {
    static ALL = [];

    static init() {
        var container = document.createElement("div");

        container.id = "TooltipContainer";
        document.body.appendChild(container);

        CONTAINER = container;
    }

    static removeAll() {
        for (var a = Tooltip.ALL.length - 1; a >= 0; a--) {
            var tooltip = Tooltip.ALL[a];

            tooltip.reference.onmouseover = null;
            tooltip.reference.onmouseout = null;

            CONTAINER.removeChild(tooltip.element);

            Tooltip.ALL.splice(a, 1);
        }
    }

    static hideAll() {
        for (var a = 0; a < Tooltip.ALL.length; a++) {
            Tooltip.ALL[a].hide();
        }
    }

    private text: string;
    private element: HTMLElement;
    private reference: HTMLElement;
    private is_opened: boolean;

    constructor(args) {
        var _this = this;
        var reference = args.reference;
        var element = document.createElement("div");

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
            reference.onmouseover = function () {
                _this.show();
            };
            reference.onmouseout = function () {
                _this.hide();
            };
        }
    }

    show() {
        if (this.text === "") {
            return;
        }

        this.is_opened = true;

        var reference = this.reference;
        var element = this.element;

        var position = $(reference).offset();

        var left = position.left;
        var top = position.top - $(element).outerHeight() - 5;

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
