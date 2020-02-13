import React, { Component } from 'react';
// import './DragNDrop.css';
import './DragNDrop.css';
import './bootstrap-4.3.1-dist/css/bootstrap.css';

export default class DragNDrop extends Component {

  state = {
  	leftImages: [],
  	rows: [{
  		images: []
  	}],
  }

  onDragStartFromLeft = (ev, src, id) => {
    ev.dataTransfer.setData("src", src);
    ev.dataTransfer.setData("id", id);
  }

  onDragStartFromRight = (ev, src, row, col) => {
    ev.dataTransfer.setData("src", src);
    ev.dataTransfer.setData("row", row);
    ev.dataTransfer.setData("col", col);
  }

  onDragOver = (ev) => {
    ev.preventDefault();
  }

  onDropLeft = (ev) => {
	  ev.preventDefault();

  	const dt = ev.dataTransfer;
  	const files = dt.files;

  	if (files && files.length > 0) {
  		this.handleFiles(files);
  	}
  	//avoid drag n drop from left to itself
  	else if (ev.dataTransfer.getData("row") && ev.dataTransfer.getData("col")) {
  		this.onDropFromRight(ev);
  	}
  }

	handleFiles = (files) => {
	  files = [...files]
	  files.forEach(this.previewFile)
	}

	previewFile = (file) => {
	  let reader = new FileReader()
	  reader.readAsDataURL(file)
	  reader.onloadend = () => {
	  	const update = {
	  		leftImages: this.state.leftImages
	  	};

	  	update.leftImages.push({
	  		src: reader.result
	  	});

	  	this.setState(update);
	  }
	}

  onDropFromRight = (ev) => {
		const data = ev.dataTransfer.getData("src");
		const row = ev.dataTransfer.getData("row");
		const col = ev.dataTransfer.getData("col");

		const update = this.state;
		update.leftImages.push({
			src: data
		});

		delete update.rows[row].images[col];

		const array = []

		//reorganize images after image is removed
		update.rows.forEach(row => {
			row.images.forEach(image => {
				array.push(image);
			})
		})

		if (array && array.length > 0) {

			update.rows = [];
			array.forEach((image, i) => {
				if (i % 3 === 0) {
					update.rows.push({
						images: [{
							src: image.src
						}]
					});
				}
				else {
					update.rows[update.rows.length - 1].images.push({
						src: image.src
					});
				}
			});
		}
		else {
			update.rows = [{
				images: []
			}];
		}

	  this.setState(update);
  }

  onFirstDoubleClick = ev => {
		ev.preventDefault()
		ev.stopPropagation();
  	// console.log(ev.target);

		const target = ev.target;
  	target.style.cursor = 'grab';

		this._LAST_MOUSE_POSITION = { x: ev.pageX, y: ev.pageY };
		console.log('[this._LAST_MOUSE_POSITION]');
		console.log(this._LAST_MOUSE_POSITION);
		this._DIV_OFFSET = target.parentNode.getBoundingClientRect();
		this._CONTAINER_HEIGHT = this._DIV_OFFSET.bottom - this._DIV_OFFSET.top;
		this._CONTAINER_WIDTH = this._DIV_OFFSET.right - this._DIV_OFFSET.left;

		this._IMAGE_OFFSET = target.getBoundingClientRect();
		this._IMAGE_HEIGHT = this._IMAGE_OFFSET.bottom - this._IMAGE_OFFSET.top;
		this._IMAGE_WIDTH = this._IMAGE_OFFSET.right - this._IMAGE_OFFSET.left;

		ev.target.addEventListener('mousemove', this.onMouseMove);
		ev.target.removeEventListener('dblclick', this.onFirstDoubleClick);
		ev.target.addEventListener('dblclick', this.onSecondDoubleClick);
  }

  onMouseMove = ev => {
		ev.preventDefault()
		ev.stopPropagation();

		const target = ev.target;

		const current_mouse_position = {
			x: ev.pageX - this._DIV_OFFSET.left,
			y: ev.pageY - this._DIV_OFFSET.top
		};

		let change_x = current_mouse_position.x - this._LAST_MOUSE_POSITION.x;
		let change_y = current_mouse_position.y - this._LAST_MOUSE_POSITION.y;

		this._LAST_MOUSE_POSITION = current_mouse_position;

		let img_top;
		let img_left;

		if (!target.style.top) {
			img_top = 0;
		}
		else {
			img_top = parseInt(target.style.top, 10);
		}

		if (!target.style.left) {
			img_left = 0;
		}
		else {
			img_left = parseInt(target.style.left, 10);
		}

		let img_top_new = img_top + change_y;
		let img_left_new = img_left + change_x;

		// Validate top and left do not fall outside the image,
		// otherwise white space will be seen */
		if(img_top_new > 0) {
			img_top_new = 0;
		}

		if(img_top_new < (this._CONTAINER_HEIGHT - this._IMAGE_HEIGHT)) {
			img_top_new = this._CONTAINER_HEIGHT - this._IMAGE_HEIGHT;
		}

		if(img_left_new > 0) {
			img_left_new = 0;
		}

		if(img_left_new < (this._CONTAINER_WIDTH - this._IMAGE_WIDTH)) {
			img_left_new = this._CONTAINER_WIDTH - this._IMAGE_WIDTH;
		}

		ev.target.style.position = "absolute";
		ev.target.style.top = img_top_new + 'px'
		ev.target.style.left = img_left_new + 'px';
	}

  onSecondDoubleClick = ev => {
		ev.preventDefault()
		ev.stopPropagation();

		this._LAST_MOUSE_POSITION = { x: null, y: null }
		this._DIV_OFFSET = null
		this._CONTAINER_HEIGHT = null
		this._CONTAINER_WIDTH = null
		this._IMAGE_OFFSET = null
		this._IMAGE_HEIGHT = null
		this._IMAGE_WIDTH = null

		ev.target.style.cursor = 'context-menu';
		ev.target.removeEventListener('mousemove', this.onMouseMove);
		ev.target.removeEventListener('dblclick', this.onSecondDoubleClick);
		ev.target.addEventListener('dblclick', this.onFirstDoubleClick);
  }

  onDropRight = (ev) => {
	  ev.preventDefault();

	  //avoid dropping from right to itself
	  if (ev.dataTransfer.getData("row") || ev.dataTransfer.getData("col")) {
	  	return;
	  }

		const data = ev.dataTransfer.getData("src");
		const id = ev.dataTransfer.getData("id");
		const update = this.state;

		delete update.leftImages[id];

		if (update.rows[update.rows.length-1].images.length > 2) {
			update.rows.push({
				images: []
			});
		}

		update.rows[update.rows.length-1].images.push({
			src: data
		});

	  this.setState(update, () => {
	  	const noOfRows = document.querySelectorAll(".list").length;

	  	const lastRow = document.querySelectorAll(".list")[noOfRows - 1];

	  	const lastRowImages = Array.prototype.slice.call(
	  		lastRow.querySelectorAll('img')
			);

			lastRowImages.forEach(function(image) {
				image.style.top = '0px';
				image.style.left = '0px';
			});
	  });
	}

  render() {
    return (
			<div className="container-fluid  h-100">
				<div className="row border-bottom">
					<h1>Drag And Drop React Demo</h1>
				</div>
				<div className="row windowSize">
					<div className="col-sm-2 border-right border-3" id="leftPanel"
            onDragOver={ (e)=>this.onDragOver(e) }
						onDrop={ (e)=>this.onDropLeft(e) }
					>
						To preview images, drag them from desktop here. (You can import multiple images.)
		  			<div id="gallery">{
		  				this.state.leftImages.map((obj, i) => {
		  					return <span key={ 'span' + i }><img alt="dragNDropImage" src={ obj.src } style={{ height: 150 }} 
		  						onDragStart={ (e)=>this.onDragStartFromLeft(e, obj.src, i) } draggable
		  						></img><p></p></span>;
		  				})
		  			}</div>
		  		</div>
					<div className="col-sm-10" id="rightPanel"
            onDragOver={ (e)=>this.onDragOver(e) }
						onDrop={ (e)=>this.onDropRight(e) }
					>
						<p>To arrange from left panel drag images here.
						<span style={{ color: 'red' }}> For larger files (> 2-3 MBs), you need to hold drag little
						bit longer because of the dataTransfer.</span> (Double click to select visible area of a
						 cropped image. Double click again to finish selection of the visible area.)</p>
						{
							this.state.rows.map((row, i) => {
								return <div key={ 'row' + i } className="row border border-3 list">{
									row.images.map((img, j) => {
										return <div key={ i + '' + j } className="col img-container">
					  					<img alt="dragNDropImage" src={ img.src }	style={{ width: '100%' }}
					  						onDragStart={ (e) => this.onDragStartFromRight(e, img.src, i, j) }
					  						onDoubleClick={ (e) => this.onFirstDoubleClick(e) } draggable
					  					></img>;
										</div>;
									})
								}</div>;
							})
						}
					</div>
				</div>
			</div>
    );
  }
}