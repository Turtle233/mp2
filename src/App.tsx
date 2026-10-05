import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { getImages } from "./api/api.ts";
import type { NasaImage } from "./api/api.ts";
import "./App.css";

interface ViewProps {
  images: NasaImage[];
}

function App() {
  const [images, setImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getImages()
      .then((data) => {
        if (active) setImages(data);
      })
      .catch(() => {
        if (active) setError("Unable to load NASA images.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header>
        <h1>Explore NASA</h1>
        <nav className="navigation">
          <Link to="/list">List</Link>
          <Link to="/gallery">Gallery</Link>
        </nav>
      </header>

      <main>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="/list" element={<ListView images={images} />} />
            <Route path="/gallery" element={<GalleryView images={images} />} />
            <Route path="/detail/:id" element={<DetailView images={images} />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        )}
      </main>
    </>
  );
}

function ListView({ images }: ViewProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [order, setOrder] = useState("asc");

  const results = images
    .filter((image) => image.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      const comparison =
        sortBy === "title" ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date);

      return order === "asc" ? comparison : -comparison;
    });

  return (
    <section>
      <h2>NASA Picture List</h2>

      <div className="controls">
        <label>
          Search titles
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a query (For example, enter Galaxy)"
          />
        </label>

        <label>
          Sort by
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="title">Title</option>
            <option value="date">Date</option>
          </select>
        </label>

        <label>
          Order
          <select value={order} onChange={(event) => setOrder(event.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <p>{results.length} results</p>

      {results.length === 0 ? (
        <p>No matching images.</p>
      ) : (
        <ul className="image-list">
          {results.map((image) => (
            <li key={image.id}>
              <Link className="list-link" to={`/detail/${encodeURIComponent(image.id)}`}>
                <strong>{image.title}</strong>
                <span className="list-meta">
                  {image.date.slice(0, 10)} | {image.center}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GalleryView({ images }: ViewProps) {
  const [center, setCenter] = useState("");

  const centers = [...new Set(images.map((image) => image.center))].sort();
  const results = images.filter((image) => center === "" || image.center === center);

  return (
    <section>
      <h2>NASA Gallery</h2>

      <div className="controls">
        <label>
          NASA center
          <select value={center} onChange={(event) => setCenter(event.target.value)}>
            <option value="">All centers</option>
            {centers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p>{results.length} results</p>

      {results.length === 0 ? (
        <p>No matching images.</p>
      ) : (
        <div className="gallery">
          {results.map((image) => (
            <Link
              className="gallery-card"
              key={image.id}
              to={`/detail/${encodeURIComponent(image.id)}`}
            >
              {image.imageUrl ? (
                <img src={image.imageUrl} alt={image.title} loading="lazy" />
              ) : (
                <p>Image unavailable</p>
              )}
              <h3>{image.title}</h3>
              <p>{image.center}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function DetailView({ images }: ViewProps) {
  const { id } = useParams();
  const index = images.findIndex((image) => image.id === id);

  if (index === -1) {
    return (
      <section>
        <h2>Image not found</h2>
        <Link to="/list">Back to List</Link>
      </section>
    );
  }

  const image = images[index];
  const previous = images[(index - 1 + images.length) % images.length];
  const next = images[(index + 1) % images.length];

  return (
    <section className="detail">
      <h2>{image.title}</h2>

      {image.imageUrl && <img className="detail-image" src={image.imageUrl} alt={image.title} />}

      <p>
        <strong>ID:</strong> {image.id}
      </p>
      <p>
        <strong>Date:</strong> {image.date.slice(0, 10)}
      </p>
      <p>
        <strong>Center:</strong> {image.center}
      </p>
      <p className="description">{image.description || "No description available."}</p>

      <nav className="navigation" aria-label="Image navigation">
        <Link to={`/detail/${encodeURIComponent(previous.id)}`}>← Previous</Link>
        <Link to="/list">Back to List</Link>
        <Link to={`/detail/${encodeURIComponent(next.id)}`}>Next →</Link>
      </nav>
    </section>
  );
}

export default App;
