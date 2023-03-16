package main

import (
	"errors"
	"log"
	"os"

	r "gopkg.in/rethinkdb/rethinkdb-go.v6"
)

func main() {
	url := os.Getenv("RETHINKDB_URL")
	password := os.Getenv("RETHINKDB_PASSWORD")

	if url == "" {
		url = "localhost:28015"
	}

	err := probe(r.ConnectOpts{
		Address:  url,
		Database: "rethinkdb",
		Username: "admin",
		Password: password,
	})
	if err != nil {
		log.Print(err)
		os.Exit(1)
	}
}

func probe(opts r.ConnectOpts) error {
	session, err := r.Connect(opts)
	if err != nil {
		return err
	}
	defer session.Close()

	res, err := r.Table("server_status").Pluck("id", "name").Run(session)
	if err != nil {
		return err
	}
	defer res.Close()

	if res.IsNil() {
		return errors.New("no server status results found")
	}

	return nil
}
