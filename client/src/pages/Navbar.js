import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainNav({ expand }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (search) {
      navigate(`/tx/${search}`);
      setSearch("");
    }
  };
  return (
    <>
      {
        <Navbar
          key={expand}
          expand={expand}
          data-bs-theme="dark"
          style={{
            backgroundColor: "#2f4f4f", // Navy blue pozadina
            borderBottom: "2px solid black", // Crni donji obrub
          }}
        >
          <Container fluid>
            <Navbar.Brand as={Link} to="/">
              Blockchain
            </Navbar.Brand>
            <Form className="d-flex pt-3" onSubmit={handleSearchSubmit}>
              <Form.Control
                type="search"
                placeholder="Search transactions"
                className="me-2"
                aria-label="Search"
                value={search}
                onChange={handleSearchChange}
              />
              <Button
                variant="outline-primary"
                type="submit"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  borderColor: "#000000",
                }}
              >
                Search
              </Button>
            </Form>
          </Container>
        </Navbar>
      }
    </>
  );
}

export default MainNav;
