window.EathPaginator = (function() {
	'use strict';
	var that;

	var EathPaginator = function(el, options) {
		if (!el) {
			throw new Error('A DOM element reference is required');
		}
		options = options || {};
		that = this;
		this.el = $(el);
		this.pages = options.pages || 1;
		this.selected = options.startPage || 1;

		this.leftEdge = options.leftEdge !== undefined ? options.leftEdge : options.edges !== undefined ? options.edges : 2;
		this.rightEdge = options.rightEdge !== undefined ? options.rightEdge : options.edges !== undefined ? options.edges : 2;

		this.leftMid = options.leftMid || options.mid || 1;
		this.rightMid = options.rightMid || options.mid || 1;

		this.dotOperator = options.dotOperator !== false; //default true
		this.hasControls = options.hasControls || false;
		this.reverseOrder = options.reverseOrder || false;
		this.pageChanged = options.pageChanged || function(pageNumber) {};

		this.pageClass = options.pageClass || 'page';
		this.prevClass = options.prevClass || 'prev';
		this.nextClass = options.nextClass || 'next';
		this.dataPageClass = options.dataPageClass || 'data-page';

		this.element = options.element || '<li>';
		this.mainClass = options.mainClass || 'pag';
		this.dotsClass = options.dotsClass || 'dots';
		this.activeClass = options.activeClass || 'active';
		this.endClass = options.endClass || 'end';

		//Hook events
		var clickClasses = '.' + this.pageClass + (this.dotOperator ? ', .' + this.dotsClass : '');
		this.el.on('click', clickClasses, function(event) {
			that.gotoPage(Number($(event.target).attr(that.dataPageClass)));
		});
		if(this.hasControls) {
			this.el.on('click', '.'+this.prevClass, function() { that.gotoPage(that.selected + (that.reverseOrder ? 1 : -1)); });
			this.el.on('click', '.'+this.nextClass, function() { that.gotoPage(that.selected + (that.reverseOrder ? -1 : 1)); });
		}

		this._redrawDOM();
	};

	EathPaginator.prototype.gotoPage = function(page) {
		if(0 < page && page <= that.pages && page != that.selected) {
			that.selected = page;
			that.pageChanged(that.selected);
			that._redrawDOM();
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

	EathPaginator.prototype._redrawDOM = function() {
		that.el.empty();
		var i, page, el, classTemp, reverseTemp,
			firstDots  = that.leftEdge + 1,
			firstMid   = firstDots + that.leftMid + 1,
			secondDots = firstMid + that.rightMid + 1,
			lastMid = that.pages - (that.rightEdge + that.rightMid + 1),
			midPos = Math.max(firstMid, Math.min(that.selected, lastMid)),
			totalPages = secondDots + that.rightEdge;

		//Add previous button
		if(that.hasControls) {
			reverseTemp = that.reverseOrder ? that.pages : 1;
			classTemp = that.mainClass.concat(' ', that.prevClass, ' ', (reverseTemp === that.selected ? that.endClass : ''));
			el = $(that.element).addClass(classTemp);
			if(that.reverseOrder) {
				reverseTemp = el;
			}
			else {
				that.el.append(el);
			}
		}
		//Add simple layout if pages are fewer than buttons.
		if(that.pages <= totalPages) {
			for(i = 1; i <= that.pages; i++) {
				classTemp = that.mainClass.concat(' ', that.pageClass, ' ', (i === that.selected ? that.activeClass : ''));
				el = $(that.element).addClass(classTemp).attr(that.dataPageClass, i);
				that.el.append(el);
			}
		}
		else {
			for(i = 1; i <= totalPages; i++) {
				page = i;
				classTemp = that.mainClass.concat(' ', that.pageClass);
				el = $(that.element).addClass(classTemp);

				if(i === firstDots && that.selected > firstMid){
					page = Math.floor((that.selected+1)/2);
					el.addClass(that.dotsClass).removeClass(that.pageClass);
				}
				else if(firstDots < i && i < secondDots) {
					page = midPos + (i - firstMid);
				}
				else if(i === secondDots && that.selected < lastMid) {
					page = Math.floor(that.selected + (that.pages - that.selected)/2);
					el.addClass(that.dotsClass).removeClass(that.pageClass);
				}
				else if(i >= secondDots) {
					page = that.pages - (totalPages - i);
				}

				el.attr(that.dataPageClass, page);

				if(page === that.selected) {
					el.addClass(that.activeClass);
				}

				if(that.reverseOrder) {
					that.el.prepend(el);
				}
				else {
					that.el.append(el);
				}
			}
		}
		//Add next button
		if(that.hasControls) {
			if(that.reverseOrder) {
				that.el.prepend(reverseTemp);
			}
			reverseTemp = that.reverseOrder ? 1 : that.pages;
			classTemp = that.mainClass.concat(' ', that.nextClass, ' ', (reverseTemp === that.selected ? that.endClass : ''));
			el = $(that.element).addClass(classTemp);
			that.el.append(el);
		}
	};

	return EathPaginator;
})();