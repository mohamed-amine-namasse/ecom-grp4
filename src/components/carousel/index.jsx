import React from 'react';
import Carousel from 'react-bootstrap/Carousel';



function MonCarousel() {
  return (
    <Carousel data-bs-theme="dark">
      <Carousel.Item>
        <img
         src="/images/morgan--landstrom-y-asllani.jpg"
          alt="First slide"
            style={{ width: '100%', height: '650px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h5>First slide label</h5>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
         src="/images/NZGQQ65S4RAWZHSC3ZANEREVJM.png"
          alt="Second slide"
           style={{ width: '100%', height: '650px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h5>Second slide label</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          src="/images/edca6.jpg"
          alt="Third slide"
           style={{ width: '100%', height: '650px', objectFit: 'cover' }}
        />
        <Carousel.Caption>
          <h5>Third slide label</h5>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
  
}

export default MonCarousel;