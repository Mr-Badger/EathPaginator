(function() {
	//'use strict';
	var that,
		timeoutID,
		lastChanged = new Date();

	this.EathPaginator = function(el, options) {
		if (!el) {
			throw new Error('A DOM element reference is required!');
		}
		that = this;
		this.el = document.getElementById(el);

		options = options || {};
		this.pages = options.pages || 1;
		this.selected = options.startPage || 1;

		this.leftEdge = options.leftEdge !== undefined ? options.leftEdge : options.edges !== undefined ? options.edges : 2;
		this.rightEdge = options.rightEdge !== undefined ? options.rightEdge : options.edges !== undefined ? options.edges : 2;

		this.leftMid = options.leftMid || options.mid || 1;
		this.rightMid = options.rightMid || options.mid || 1;

		this.dotOperator = options.dotOperator !== false; //default true
		this.controls = options.controls || false;
		this.reverseOrder = options.reverseOrder || false;

		this.keyboard = $(options.keyboard) || undefined;
		this.prevKeyCode = options.prevKeyCode || 37; //left-arrow
		this.nextKeyCode = options.nextKeyCode || 39; //right-arrow

		this.changeDelay = options.changeDelay || 800;
		this.pageChanged = options.pageChanged || function() {};

		this.pageClass = options.pageClass || 'page';
		this.prevClass = options.prevClass || 'prev';
		this.nextClass = options.nextClass || 'next';
		this.dataPageClass = options.dataPageClass || 'data-page';

		this.element = options.element || 'li';
		this.mainClass = options.mainClass || 'pag';
		this.dotsClass = options.dotsClass || 'dots';
		this.activeClass = options.activeClass || 'active';
		this.endClass = options.endClass || 'end';


		var temp = $(this.el);
		//Hook events
		var clickClasses = '.' + this.pageClass + (this.dotOperator ? ', .' + this.dotsClass : '');
		temp.on('click', clickClasses, function(event) {
			that.gotoPage(Number(event.target.getAttribute(that.dataPageClass)));
		});
		if(this.controls) {
			temp.on('click', '.' + this.prevClass, function() {
				that.gotoPage(that.selected - 1);
			});
			temp.on('click', '.' + this.nextClass, function() {
				that.gotoPage(that.selected + 1);
			});
		}
		if(this.keyboard !== undefined) {
			this.keyboard.on('keyup', keyboardEvents);
		}

		drawDOM();
	};

	EathPaginator.prototype.gotoPage = function(page) {
		if(0 < page && page <= that.pages && page != that.selected) {
			var now = new Date();
			if(now - lastChanged < that.changeDelay) {
				window.clearTimeout(timeoutID);
			}
			timeoutID = window.setTimeout(function() { that.pageChanged(that.selected); }, that.changeDelay);
			lastChanged = now;

			that.selected = page;
			drawDOM();
		}
	};

	EathPaginator.prototype.resetPages = function(pages) {
		if(0 < pages) {
			that.pages = pages;
			that.gotoPage(1);
		}
	};

	EathPaginator.prototype.getPageCount = function() {
		return that.pages;
	};

	EathPaginator.prototype.getActivePage = function() {
		return that.selected;
	};

	function keyboardEvents(event) {
		switch(event.keyCode) {
			case that.prevKeyCode:   //left-arrow
				that.gotoPage(that.selected + (that.reverseOrder ? 1 : -1));
				break;
			case that.nextKeyCode:   //right-arrow
				that.gotoPage(that.selected + (that.reverseOrder ? -1 : 1));
				break;
		}
	}

	function drawDOM() {
		while (that.el.firstChild) {
			that.el.removeChild(that.el.firstChild);
		}
		var i, page, item,
			items      = [],
			firstDots  = that.leftEdge + 1,
			firstMid   = firstDots + that.leftMid + 1,
			secondDots = firstMid + that.rightMid + 1,
			lastMid = that.pages - (that.rightEdge + that.rightMid + 1),
			midPos = Math.max(firstMid, Math.min(that.selected, lastMid)),
			totalPages = secondDots + that.rightEdge;

		//Add previous button
		if(that.controls) {
			item = document.createElement(that.element);
			item.className = that.mainClass.concat(' ', that.prevClass, ' ', (that.selected === 1 ? that.endClass : ''));
			items.push(item);
		}
		//Add simple layout if pages are fewer than buttons.
		if(that.pages <= totalPages) {
			for(i = 1; i <= that.pages; i++) {
				item = document.createElement(that.element);
				item.className = that.mainClass.concat(' ', that.pageClass, ' ', (that.selected === i ? that.activeClass : ''));
				item.setAttribute(that.dataPageClass, i);
				items.push(item);
			}
		}
		else {
			for(i = 1; i <= totalPages; i++) {
				item = document.createElement(that.element);
				item.className = that.mainClass;

				if(i === firstDots && that.selected > firstMid){
					item.className += ' ' + that.dotsClass;
					page = Math.floor((that.selected+1)/2);
				}
				else if(i === secondDots && that.selected < lastMid) {
					item.className += ' ' + that.dotsClass;
					page = Math.floor(that.selected + (that.pages - that.selected)/2);
				}
				else {
					item.className += ' ' + that.pageClass;
					if(i <= firstDots) {
						page = i;
					}
					else if(firstDots < i && i < secondDots) {
						page = midPos + (i - firstMid);
					}
					else if(i >= secondDots) {
						page = that.pages - (totalPages - i);
					}
				}

				item.setAttribute(that.dataPageClass, page);

				if(page === that.selected) {
					item.className += ' ' + that.activeClass;
				}
				items.push(item);
			}
		}
		//Add next button
		if(that.controls) {
			item = document.createElement(that.element);
			item.className = that.mainClass.concat(' ', that.nextClass, ' ', (that.selected === that.pages ? that.endClass : ''));
			items.push(item);
		}

		for(i = 0; i < items.length; i++) {
			if(that.reverseOrder) {
				that.el.insertBefore(items[i], that.el.firstChild);
			}
			else {
				that.el.appendChild(items[i]);
			}
		}
	}
})();