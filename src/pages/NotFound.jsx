export default function NotFound() {
  return (
    <div style={{ 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
      <h2 style={{ marginBottom: "0.5rem" }}>Page Not Found</h2>
      <p>The page you’re looking for does not exist.</p>
      <a href="/" style={{ 
        marginTop: "1.5rem",
        color: "#007bff",
        textDecoration: "underline"
      }}>
        Go back to Home
      </a>
    </div>
  );
}
