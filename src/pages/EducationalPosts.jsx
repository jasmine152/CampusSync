
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// API 1: Educational resources from Wikipedia
const API_URL =
  "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=education%20OR%20learning%20OR%20science%20OR%20mathematics%20OR%20computer%20science&srprop=snippet%7Cwordcount&srinfo=totalhits&srlimit=30&format=json&origin=*";

// API 2: Your own student posts
const MY_API_URL = "http://localhost:3001/posts";

function EducationalPosts() {
  const { currentUser } = useAuth();

  const [apiPosts, setApiPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    body: "",
    tags: ""
  });

  // Fetch educational resources and student posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    const errors = [];

    // Fetch Wikipedia educational search results
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Wikipedia request failed");
      }

      const data = await response.json();

      const results = (data.query?.search || []).map((item) => ({
        id: item.pageid,
        title: item.title,
        body: item.snippet
          .replace(/<[^>]*>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&#039;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">"),
        tags: ["Wikipedia", "Learning Resource"],
        pageUrl: `https://en.wikipedia.org/?curid=${item.pageid}`,
        wordcount: item.wordcount
      }));

      setApiPosts(results);
    } catch (err) {
      console.error("Wikipedia API error:", err);
      errors.push("Wikipedia resources could not load.");
    }

    // Fetch student posts from JSON Server
    try {
      const response = await fetch(MY_API_URL);

      if (!response.ok) {
        throw new Error("Student posts request failed");
      }

      const data = await response.json();
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Student posts API error:", err);
      errors.push(
        "Student posts API is unavailable. Start JSON Server using npm run server."
      );
    }

    setError(errors.join(" "));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Create a new post or update an existing one
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const body = form.body.trim();

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!title || !body) {
      alert("Please enter both title and content.");
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        title,
        body,
        tags,
        author: currentUser?.name || "Student",
        authorEmail: currentUser?.email || "",
        createdAt: new Date().toISOString()
      };

      let response;

      if (editingId !== null) {
        // Update post in JSON Server
        response = await fetch(`${MY_API_URL}/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        });
      } else {
        // Create post in JSON Server
        response = await fetch(MY_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postData)
        });
      }

      if (!response.ok) {
        throw new Error("Could not save post");
      }

      const savedPost = await response.json();

      if (editingId !== null) {
        setMyPosts((posts) =>
          posts.map((post) =>
            String(post.id) === String(editingId)
              ? savedPost
              : post
          )
        );

        alert("Post updated successfully!");
      } else {
        setMyPosts((posts) => [savedPost, ...posts]);
        alert("Your post was published successfully!");
      }

      setEditingId(null);
      setForm({
        title: "",
        body: "",
        tags: ""
      });
    } catch (err) {
      console.error("Post submission error:", err);
      alert(
        "Could not save your post. Check that JSON Server is running on port 3001."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a student post
  const startEdit = (post) => {
    setEditingId(post.id);

    setForm({
      title: post.title || "",
      body: post.body || "",
      tags: (post.tags || []).join(", ")
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete a student post
  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`${MY_API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Delete request failed");
      }

      setMyPosts((posts) =>
        posts.filter((post) => String(post.id) !== String(id))
      );

      if (String(editingId) === String(id)) {
        setEditingId(null);
        setForm({
          title: "",
          body: "",
          tags: ""
        });
      }

      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete post. Check your JSON Server.");
    }
  };

  // Search both sets of posts
  const matchesSearch = (post) =>
    `${post.title} ${post.body} ${(post.tags || []).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const filteredMine = myPosts.filter(matchesSearch);
  const filteredAPI = apiPosts.filter(matchesSearch);

  return (
    <div className="page-container educational-page">
      <div className="page-header">
        <h1>📚 Educational Posts</h1>
        <p>
          Share your knowledge, discover study resources, and learn together.
        </p>
      </div>

      {/* CREATE AND EDIT FORM */}
      <section className="edu-form-card">
        <h2>
          {editingId !== null
            ? "Edit Your Post"
            : "Create an Educational Post"}
        </h2>

        <form onSubmit={handleSubmit} className="edu-form">
          <label htmlFor="edu-title">Post Title</label>

          <input
            id="edu-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Tips to learn React"
            maxLength={120}
            required
          />

          <label htmlFor="edu-body">Content</label>

          <textarea
            id="edu-body"
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Share your notes, study tips, or learning resources..."
            maxLength={3000}
            rows={5}
            required
          />

          <label htmlFor="edu-tags">
            Tags (comma-separated)
          </label>

          <input
            id="edu-tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="React, JavaScript, Study Tips"
            maxLength={150}
          />

          <div className="edu-form-actions">
            <button
              className="edu-primary-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId !== null
                ? "Save Changes"
                : "Publish Post"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="edu-cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    body: "",
                    tags: ""
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* SEARCH */}
      <div className="edu-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search study resources and student posts..."
          aria-label="Search educational posts"
        />
      </div>

      {loading && (
        <p className="edu-message">
          Loading educational resources...
        </p>
      )}

      {error && (
        <div className="edu-error">
          <p>{error}</p>

          <button type="button" onClick={loadPosts}>
            Retry
          </button>
        </div>
      )}

      {/* STUDENT POSTS: YOUR JSON SERVER API */}
      <section className="edu-section">
        <div className="edu-section-heading">
          <h2>✍️ Student Posts</h2>
          <span>{filteredMine.length} post(s)</span>
        </div>

        {!loading && filteredMine.length === 0 && (
          <div className="edu-empty">
            No student posts yet. Create your first post above!
          </div>
        )}

        <div className="edu-post-grid">
          {filteredMine.map((post) => (
            <article className="edu-post-card" key={post.id}>
              <span className="edu-post-label">
                Student Contribution
              </span>

              <h3>{post.title}</h3>

              <p className="edu-post-body">
                {post.body}
              </p>

              <div className="edu-tags">
                {(post.tags || []).map((tag, index) => (
                  <span key={`${tag}-${index}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="edu-author">
                By {post.author || "Student"}
              </p>

              <div className="edu-post-actions">
                <button
                  type="button"
                  onClick={() => startEdit(post)}
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  className="edu-delete-btn"
                  onClick={() => deletePost(post.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WIKIPEDIA EDUCATIONAL RESOURCES */}
      <section className="edu-section">
        <div className="edu-section-heading">
          <h2>📖 Explore Study Resources</h2>
          <span>Powered by Wikipedia API</span>
        </div>

        {!loading && filteredAPI.length === 0 && !error && (
          <div className="edu-empty">
            No matching learning resources found.
          </div>
        )}

        <div className="edu-post-grid">
          {filteredAPI.map((post) => (
            <article className="edu-post-card" key={post.id}>
              <span className="edu-post-label">
                Wikipedia Learning Resource
              </span>

              <h3>{post.title}</h3>

              <p className="edu-post-body">
                {post.body.replace(/\s+/g, " ")}
              </p>

              <div className="edu-tags">
                {post.tags.map((tag, index) => (
                  <span key={`${post.id}-${index}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="edu-author">
                📚 {post.wordcount ?? 0} words in the article
              </p>

              <a
                href={post.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="edu-read-link"
              >
                Read Full Article →
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EducationalPosts;
