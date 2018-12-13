# repo-cop

CLI tool allowing to easily manage your projects inside monorepo.

## Install

> The package is not yet published, so you need to clone the repo and execute the following command from within the project folder.

```bash
npm link
```

## Usage

### Show projects

```
repo-cop
```

### Filter projects by folder name

```
repo-cop -f fancy-pants
```

### Filter projects having a dependency

```
repo-cop -d wix-style-react
```

### Filter specific projects having a dependency

```
repo-cop -f fancy-pants -d wix-style-react
```
